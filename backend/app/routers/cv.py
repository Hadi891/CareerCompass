# backend/app/routers/cv.py

import os
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from ..utils.coursera_searcher import CourseraSearcher
from ..crud import create_courses_for_cv, generate_and_save_suggestions

from ..crud import save_recommended_courses

from sqlalchemy.orm import Session
import json, logging

from .. import models
from ..crud import create_cv
from ..dependencies import get_db, get_current_user
from ..utils.cv_parser import (
    extract_text,
    extract_links,
    extract_images,
    build_parse_prompt,
    call_mistral,
)
from ..schemas import CVOut
from ..models import CVMeta

router = APIRouter(prefix="/cv")

@router.post("/upload", response_model=CVOut, status_code=status.HTTP_201_CREATED)
async def upload_cv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    # 1) Ensure upload dir exists
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    # 2) Save the file
    file_path = os.path.join(upload_dir, file.filename)
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not save uploaded file")

    # 3) Parse with your utilities
    text = extract_text(file_path)
    links = extract_links(file_path)
    images = extract_images(file_path, output_dir=upload_dir)

    
    logger = logging.getLogger(__name__)
    
    # 4) Build prompt + call LLM
    prompt = build_parse_prompt(text, links)
    raw = call_mistral(prompt)   # raw JSON text
    logger.info("LLM raw output: %r", raw) 
    # extract the first {...} block and ignore anything after it
    # pull out everything from the first '{' to the last '}' so we get the full JSON
    start = raw.find("{")
    end   = raw.rfind("}") + 1
    if start == -1 or end == 0:
        logger.error("LLM output didn't contain any JSON braces")
        raise HTTPException(500, "LLM response did not contain JSON")

    json_text = raw[start:end]
    try:
        parsed = json.loads(json_text)
    except json.JSONDecodeError as err:
        # logger.error("Failed to JSON-decode LLM output: %s", err)
        raise HTTPException(500, "Failed to parse LLM response as JSON")
    # logger.info("LLM parsed output: %r", parsed) 

    # ─── normalize for CVParsed ─────────────────────────────────────
    # 1) pull top-level meta fields into parsed["meta"]
    if "meta" not in parsed:
        meta = {k: parsed.pop(k, None)
                for k in ["name","email","phone","bio","linkedin","github"]}
        # everything that’s left is education/experience/skills/projects
        parsed = {"meta": meta, **parsed}
        logger.info("name: %s, email: %s, phone: %s, bio: %s, linkedin: %s, github: %s",
                    meta.get("name"), meta.get("email"), meta.get("phone"), meta.get("bio"), meta.get("linkedin"), meta.get("github"))

    # 2) turn each flat skill string into a dict with {"name": …}
    parsed["skills"] = [
        s["name"] if isinstance(s, dict) and "name" in s else s
        for s in parsed.get("skills", [])
    ]

    # 3) ensure each project's tools is a real list
    for proj in parsed.get("projects", []):
        tools = proj.get("tools", [])
        if isinstance(tools, str):
            proj["tools"] = [t.strip() for t in tools.split(",") if t.strip()]
            
    # 4) collapse single‐item link lists into a string (or None)
    for proj in parsed.get("projects", []):
        link = proj.get("link")
        if isinstance(link, str):
            if not (link.startswith("http://") or link.startswith("https://")):
                proj["link"] = None
        elif isinstance(link, list):
            valid = [
                l for l in link
                if isinstance(l, str)
                and (l.startswith("http://") or l.startswith("https://"))
            ]
            proj["link"] = valid or None



    for key in ("linkedin", "github"):
        val = parsed["meta"].get(key)
        if isinstance(val, str):
            parsed["meta"][key] = val.strip().strip("'").strip('"')
            
    domain          = parsed.pop("domain", None)
    missing_skills  = parsed.pop("missing_skills", [])
    
    parsed["meta"]["domain"]         = domain
    parsed["missing_skills"] = missing_skills


    # 5) Persist CV record
    cv = create_cv(
        db,
        user_id=user.id,
        filename=file.filename,
        parsed=parsed,
        images=images,
    )
    
        # ─── save domain on the User ──────────────────────────────────
    if domain:
        user.domain = domain
        db.add(user)
    
    # domain = parsed["meta"]["domain"]
    skills = parsed["skills"]
    generate_and_save_suggestions(db, cv.id, domain, skills)

    # ─── upsert missing skills ────────────────────────────────────
    # (delete old, then bulk insert fresh)
    db.query(models.MissingSkill).filter_by(cv_id=cv.id).delete()
    for skill in missing_skills:
        if skill and isinstance(skill, str):
            db.add(models.MissingSkill(cv_id=cv.id, name=skill.strip()))
            
    db.commit()
    
    save_recommended_courses(db, cv.id, missing_skills)
    db.refresh(cv)  # ensure relationships are loaded
    
    parsed["suggested_projects"] = [
      {
        "id":          sp.id,
        "name":       sp.name,
        "description":sp.description,
        "tools":      sp.tools or [],
        "difficulty": sp.difficulty,
        "tasks":      sp.tasks or [],
      }
      for sp in cv.suggested_projects
    ]
    
    courses_out = [
        {
        "skill":       c.skill,
        "level":       c.level,
        "title":       c.title,
        "url":         c.url,
        "description": c.description,
        "rating":      c.rating,
        "duration":    c.duration,
        }
    for c in cv.courses
]

    # stick them into parsed
    parsed["courses"] = courses_out
    
        # 5b) Persist the meta block into cv_meta
    meta_dict = parsed["meta"]
    existing = db.query(CVMeta).get(cv.id)
    if existing:
        existing.name     = meta_dict.get("name")
        existing.email    = meta_dict.get("email")
        existing.phone    = meta_dict.get("phone")
        existing.bio      = meta_dict.get("bio")
        existing.linkedin = meta_dict.get("linkedin")
        existing.github   = meta_dict.get("github")
        existing.domain   = domain
    else:
        db.add(CVMeta(
            cv_id    = cv.id,
            name     = meta_dict.get("name"),
            email    = meta_dict.get("email"),
            phone    = meta_dict.get("phone"),
            bio      = meta_dict.get("bio"),
            linkedin = meta_dict.get("linkedin"),
            github   = meta_dict.get("github"),
            domain   = domain,
        ))
    db.commit()
    # 6) Mark that the user has now uploaded a CV
    user.has_uploaded_cv = True
    db.add(user)
    db.commit()
    
    



    return {
      "id":         cv.id,
      "filename":   cv.filename,
      "created_at": cv.created_at,
      "parsed":     parsed,
    }


@router.get("/me", response_model=CVOut, status_code=status.HTTP_200_OK)
def read_my_cv(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    # grab the most recent CV for this user
    cv: models.CV = (
        db.query(models.CV)
          .filter(models.CV.user_id == user.id)
          .order_by(models.CV.created_at.desc())
          .first()
    )
    if not cv:
        raise HTTPException(404, "No CV found for this user")

    education = [
        {
          "degree":      e.degree,
          "university":  e.university,
          "location":    e.location,
          "gpa":         e.gpa,
          "description": e.description,
          "start_date":  e.start_date,
          "end_date":    e.end_date,
        }
        for e in cv.edus
    ]
    # assemble the “parsed” blob just like in your upload handler
    meta = {
        "name":     cv.meta.name,
        "email":    cv.meta.email,
        "phone":    cv.meta.phone,
        "bio":      cv.meta.bio,
        "linkedin": cv.meta.linkedin,
        "github":   cv.meta.github,
        "domain":   cv.meta.domain,
    }
    experience = [
        {
          "role":        x.role,
          "company":     x.company,
          "location":    x.location,
          "date":        x.date,
          "description": x.description,
        }
        for x in cv.exps
    ]
    skills = [s.name for s in cv.skills]
    projects = []
    for p in cv.projects:
        # 1) tools must be a list
        raw_tools = p.tools or ""
        if isinstance(raw_tools, str):
            tools = [t.strip() for t in raw_tools.split(",") if t.strip()]
        else:
            tools = raw_tools

        # 2) link must be a list of valid URL(s)
        raw_link = p.link
        links: list[str] = []
        if raw_link:
            if isinstance(raw_link, str):
                cleaned = raw_link.strip().strip('"')
                if cleaned and cleaned.lower() != "null":
                    links = [cleaned]
            elif isinstance(raw_link, list):
                # drop any falsy or "null" strings
                links = [
                    l.strip().strip('"')
                    for l in raw_link
                    if isinstance(l, str) and l.strip().lower() != "null"
                ]

        projects.append({
            "name":        p.name,
            "tools":       tools,
            "description": p.description,
            "link":        links,
        })
    

    # pull missing skills for this CV
    missing_skills = [ms.name for ms in cv.missing_skills]

    # pull courses from DB
    courses = [
        {
          "skill":       c.skill,
          "level":       c.level,
          "title":       c.title,
          "url":         c.url,
          "description": c.description,
          "rating":      c.rating,
          "duration":    c.duration,
        }
        for c in cv.courses
    ]
    
    suggested = [
      {
        "id":          sp.id,
        "name":        sp.name,
        "description": sp.description,
        "tools":       sp.tools or [],
        "difficulty":  sp.difficulty,
        "tasks":       sp.tasks or [],
      }
      for sp in cv.suggested_projects
    ]
    
    return {
      "id":         cv.id,
      "filename":   cv.filename,
      "created_at": cv.created_at,
      "parsed": {
        "meta":      meta,
        "education": education,
        "experience": experience,
        "skills":    skills,
        "missing_skills": missing_skills,
        "projects":  projects,
        "courses":   courses,
        "suggested_projects": suggested,
      },
    }