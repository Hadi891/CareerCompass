import json
from typing import List
from sqlalchemy.orm import Session
from . import models
from .utils.security import hash_password, verify_password
from .models import Course
from .utils.coursera_searcher import CourseraSearcher
from .utils.cv_parser import call_mistral
from .models import ChatMessage, SuggestedProject
from .utils.ollama import chat_with_deepseek
import logging
logger = logging.getLogger(__name__)


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, email: str, password: str):
    hashed = hash_password(password)
    user = models.User(email=email, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if user and verify_password(password, user.hashed_password):
        return user
    return None

def create_cv(db: Session, user_id: int, filename: str, parsed: dict, images: list):
    """
    Persist a new CV and all its parts into the relational tables.
    """
    # 1) Core CV record
    cv = models.CV(user_id=user_id, filename=filename)
    db.add(cv)
    db.flush()  # so cv.id is populated

    # 2) Meta
    m = parsed
    meta = models.CVMeta(
        cv_id=cv.id,
        name=m.get("name"),
        email=m.get("email"),
        phone=m.get("phone"),
        bio=m.get("bio"),
        linkedin=m.get("linkedin"),
        github=m.get("github")
    )
    db.add(meta)

    # 3) Education entries
    for edu in parsed["education"]:
        db.add(models.Education(cv_id=cv.id, **edu))

    # 4) Experience entries
    for exp in parsed["experience"]:
        db.add(models.Experience(cv_id=cv.id, **exp))

    # 5) Skills
    for sk in parsed["skills"]:
        # if skills is a list of strings:
        if isinstance(sk, str):
            db.add(models.Skill(cv_id=cv.id, name=sk))
        # or if it’s a list of dicts:
        elif isinstance(sk, dict) and "name" in sk:
            db.add(models.Skill(cv_id=cv.id, name=sk["name"]))

    # 6) Projects
    for pr in parsed["projects"]:
        # expecting keys: name, tools (list), description, link
        # flatten tools list into a comma‐separated string:
        tools = pr.get("tools")
        tools_csv = ",".join(tools) if isinstance(tools, list) else None
        db.add(models.Project(
            cv_id=cv.id,
            name=pr.get("name"),
            tools=tools_csv,
            description=pr.get("description"),
            link=pr.get("link"),
        ))

    # 7) Commit all at once
    db.commit()
    db.refresh(cv)
    return cv

def create_courses_for_cv(db: Session, cv_id: int, courses_data: List[dict]):
    """
    Wipe out any existing courses for this CV and insert fresh ones.
    Only the fields you declared on your Course model:
      skill, level, title, url, description, rating, duration
    """
    db.query(Course).filter(Course.cv_id == cv_id).delete()
    for c in courses_data:
        db.add(Course(
            cv_id      = cv_id,
            skill      = c["skill"],
            level      = c["level"],
            title      = c["title"],
            description= c.get("description", ""),
            url        = c["url"],
            rating     = c.get("rating", 0.0),
            duration   = c.get("duration", ""),
        ))
    db.commit()

def save_recommended_courses(db: Session, cv_id: int, missing_skills: List[str]):
    """
    Use your CourseraSearcher to scrape + pick top 3 courses per skill/level,
    then dump them into the DB for that CV.
    """
    searcher = CourseraSearcher()
    results = searcher.search_multiple_skills(missing_skills)

    # flatten into a list of dicts
    courses_to_save = []
    for skill, by_level in results.items():
        for level, courses in by_level.items():
            for course in courses:
                courses_to_save.append({
                    "skill":      skill,
                    "level":      level,
                    "title":      course["title"],
                    "description":course.get("description", ""),
                    "url":        course["url"],
                    "rating":     course.get("rating", 0.0),
                    "duration":   course.get("duration", ""),
                })

    create_courses_for_cv(db, cv_id, courses_to_save)
    
def generate_and_save_suggestions(
    db: Session,
    cv_id: int,
    domain: str,
    skills: list[str],
):
    # 1) Prompt the LLM
    prompt = f"""
    You are a career coach. The user’s domain is {domain}, and these are their core skills: {', '.join(skills)}.
    Propose exactly 4 project ideas: 1 easy, 2 medium, 1 hard.
    For each project, return a JSON object with:
      - name
      - description
      - tools (a list of 3–5 tech/tools)
      - difficulty ("easy"|"medium"|"hard")
      - tasks (exactly 6 bullet-point strings: the steps to complete it)
    Respond with a top‐level JSON array.
    """
    raw = call_mistral(prompt)
    data = json.loads(raw)  # expect List[dict]

    # 2) clear out old suggested‐projects
    db.query(models.SuggestedProject).filter_by(cv_id=cv_id).filter(models.SuggestedProject.difficulty != None).delete()
    db.flush()

    # 3) insert the new ones
    for proj in data:
        db.add(models.SuggestedProject(
            cv_id       = cv_id,
            name        = proj["name"],
            description = proj["description"],
            tools       = proj["tools"],
            difficulty  = proj["difficulty"],
            tasks       = proj["tasks"],
        ))
    db.commit()
    

def get_chat_history(db: Session, project_id: int) -> List[ChatMessage]:
    return (
      db.query(ChatMessage)
        .filter(ChatMessage.project_id == project_id)
        .order_by(ChatMessage.timestamp)
        .all()
    )

def save_message(db: Session, project_id: int, sender: str, content: str) -> ChatMessage:
    msg = ChatMessage(project_id=project_id, sender=sender, content=content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

def send_and_save_chat(db: Session, project_id: int, user_input: str) -> ChatMessage:
    # 1) save user message
    logger.info("Saving user message for project %s: %r", project_id, user_input)
    save_message(db, project_id, "user", user_input)

    # 2) pull project context + history
    proj = db.query(SuggestedProject).get(project_id)
    history = get_chat_history(db, project_id)

    # 3) build a single prompt
    prompt = f"""
Project: {proj.name}
Description: {proj.description}
Tools: {', '.join(proj.tools or [])}
Tasks: {', '.join(proj.tasks or [])}

"""
    for m in history:
        prompt += f"{m.sender}: {m.content}\n"
    prompt += f"user: {user_input}\nassistant:"

    # 4) call Ollama
    try:
        reply = chat_with_deepseek(prompt)
        logger.info("Ollama replied: %r", reply)
    except Exception as e:
        logger.exception("Ollama helper failed")
        raise

    # 5) save assistant reply
    logger.info("Saving assistant reply for project %s", project_id)
    return save_message(db, project_id, "assistant", reply)