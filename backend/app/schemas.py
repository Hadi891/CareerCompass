from pydantic import BaseModel, HttpUrl, EmailStr
from typing import List, Optional, Union
from datetime import datetime
from pydantic import HttpUrl

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime
    has_uploaded_cv: bool
    
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class EducationIn(BaseModel):
    degree: Optional[str]
    university: Optional[str]
    location: Optional[str]
    gpa: Optional[str]
    description: Optional[str]
    start_date: Optional[str]
    end_date: Optional[str]
    
    class Config:
        orm_mode = True

class ExperienceIn(BaseModel):
    role: Optional[str]
    company: Optional[str]
    location: Optional[str]
    date: Optional[str]
    description: Optional[str]
    
    class Config:
        orm_mode = True

class ProjectIn(BaseModel):
    name: Optional[str]
    tools: List[str]
    description: Optional[str]
    link: Optional[Union[HttpUrl, List[HttpUrl]]]
    
    class Config:
        orm_mode = True

class CVMetaIn(BaseModel):
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    bio: Optional[str]
    linkedin: Optional[HttpUrl]
    github: Optional[HttpUrl]
    domain: Optional[str]
    
    class Config:
        orm_mode = True

class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    tools: List[str]

    # new fields for suggested projects
    difficulty: Optional[str]
    tasks: Optional[List[str]]

    class Config:
        orm_mode = True
        
class CourseOut(BaseModel):
    skill: str
    level: str
    title: str
    url: HttpUrl
    description: Optional[str]
    rating: Optional[float]
    duration: Optional[str]

    class Config:
        orm_mode = True

class CVParsed(BaseModel):
    meta: CVMetaIn
    education: List[EducationIn]
    experience: List[ExperienceIn]
    skills: List[str]
    missing_skills: List[str]
    projects: List[ProjectIn]
    courses: List[CourseOut]
    suggested_projects: List[ProjectOut]
    
    class Config:
        orm_mode = True

class CVOut(BaseModel):
    id: int
    filename: str
    created_at: datetime
    parsed: CVParsed

    class Config:
        orm_mode = True

class UserProfileOut(UserOut):
    id: int
    email: str
    created_at: datetime
    has_uploaded_cv: bool
    cv: Optional[CVOut] = None

    class Config(UserOut.Config):
        orm_mode = True