from sqlalchemy import (
    Column, Float, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean
)
from sqlalchemy.orm import relationship
from .db import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at      = Column(DateTime, default=datetime.utcnow)
    has_uploaded_cv = Column(Boolean, default=False)

    cvs = relationship("CV", back_populates="owner")

class CV(Base):
    __tablename__ = "cvs"
    id        = Column(Integer, primary_key=True, index=True)
    user_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename  = Column(String, nullable=False)
    created_at= Column(DateTime, default=datetime.utcnow)

    owner     = relationship("User", back_populates="cvs")
    meta      = relationship("CVMeta", uselist=False, back_populates="cv")
    edus      = relationship("Education",   back_populates="cv", cascade="all, delete-orphan")
    exps      = relationship("Experience",  back_populates="cv", cascade="all, delete-orphan")
    skills    = relationship("Skill",       back_populates="cv", cascade="all, delete-orphan")
    projects  = relationship("Project",     back_populates="cv", cascade="all, delete-orphan")
    missing_skills = relationship("MissingSkill", back_populates="cv", cascade="all, delete-orphan")
    courses   = relationship("Course", back_populates="cv", cascade="all, delete-orphan")
    suggested_projects = relationship("SuggestedProject", back_populates="cv", cascade="all, delete-orphan")
    
class Course(Base):
    __tablename__ = "courses"
    id          = Column(Integer, primary_key=True, index=True)
    cv_id       = Column(Integer, ForeignKey("cvs.id"), nullable=False)
    skill       = Column(String, nullable=False)
    title       = Column(String, nullable=False)
    description = Column(Text)
    url         = Column(String)
    level       = Column(String)
    rating      = Column(Float, nullable=True)
    duration    = Column(String, nullable=True)

    cv          = relationship("CV", back_populates="courses")

class CVMeta(Base):
    __tablename__ = "cv_meta"
    cv_id     = Column(Integer, ForeignKey("cvs.id"), primary_key=True)
    name      = Column(String)
    email     = Column(String)
    phone     = Column(String)
    bio       = Column(Text)
    linkedin  = Column(String)
    github    = Column(String)
    domain    = Column(String, nullable=True)

    cv        = relationship("CV", back_populates="meta")
    
class SuggestedProject(Base):
    __tablename__ = "suggested_projects"
    id          = Column(Integer, primary_key=True, index=True)
    cv_id       = Column(Integer, ForeignKey("cvs.id"), nullable=False)

    name        = Column(String)
    tools       = Column(JSON, nullable=True)
    description = Column(Text, nullable=True)
    link        = Column(JSON, nullable=True)

    # → for suggested projects, we’ll store:
    difficulty  = Column(String, nullable=True)   # "easy" | "medium" | "hard"
    tasks       = Column(JSON, nullable=True)     # ["Task 1", …, "Task 6"]

    cv          = relationship("CV", back_populates="suggested_projects")
    chat_messages = relationship("ChatMessage", back_populates="project", cascade="all, delete-orphan")
    

class Education(Base):
    __tablename__ = "educations"
    id         = Column(Integer, primary_key=True, index=True)
    cv_id      = Column(Integer, ForeignKey("cvs.id"), nullable=False)
    degree     = Column(String)
    university = Column(String)
    location   = Column(String)
    gpa        = Column(String)
    description= Column(Text)
    start_date = Column(String)
    end_date   = Column(String)

    cv         = relationship("CV", back_populates="edus")

class Experience(Base):
    __tablename__ = "experiences"
    id         = Column(Integer, primary_key=True, index=True)
    cv_id      = Column(Integer, ForeignKey("cvs.id"), nullable=False)
    role       = Column(String)
    company    = Column(String)
    location   = Column(String)
    date       = Column(String)
    description= Column(Text)

    cv         = relationship("CV", back_populates="exps")

class Skill(Base):
    __tablename__ = "skills"
    id     = Column(Integer, primary_key=True, index=True)
    cv_id  = Column(Integer, ForeignKey("cvs.id"), nullable=False)
    name   = Column(String, index=True)

    cv     = relationship("CV", back_populates="skills")
    
    
class MissingSkill(Base):
    __tablename__ = "missing_skills"
    cv_id = Column(Integer, ForeignKey("cvs.id"), primary_key=True)
    name  = Column(String, primary_key=True)
    cv    = relationship("CV", back_populates="missing_skills")

class Project(Base):
    __tablename__ = "projects"
    id          = Column(Integer, primary_key=True, index=True)
    cv_id       = Column(Integer, ForeignKey("cvs.id"), nullable=False)
    name        = Column(String)
    tools       = Column(JSON, nullable=True)       # list of tool names
    description = Column(Text, nullable=True)
    link        = Column(JSON, nullable=True)

    cv          = relationship("CV", back_populates="projects")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id          = Column(Integer, primary_key=True, index=True)
    project_id  = Column(Integer, ForeignKey("suggested_projects.id"), nullable=False)
    sender      = Column(String, nullable=False)   # "user" or "assistant"
    content     = Column(Text, nullable=False)
    timestamp   = Column(DateTime, default=datetime.utcnow)

    project     = relationship("SuggestedProject", back_populates="chat_messages")