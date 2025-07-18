from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..crud import get_chat_history, send_and_save_chat
from ..dependencies import get_db

router = APIRouter()

@router.get("/projects/{project_id}/chat")
def read_chat(project_id: str, db: Session = Depends(get_db)):
    msgs = get_chat_history(db, project_id)
    return [
      {
        "id":        m.id,
        "sender":    m.sender,
        "content":   m.content,
        "timestamp": m.timestamp.isoformat(),
      }
      for m in msgs
    ]

@router.post("/projects/{project_id}/chat")
def post_chat(project_id: str, payload: dict, db: Session = Depends(get_db)):
    user_input = payload.get("message")
    if not user_input:
        raise HTTPException(400, "Missing `message` in body")
    assistant_msg = send_and_save_chat(db, project_id, user_input)
    return {
      "assistant": {
        "id":        assistant_msg.id,
        "content":   assistant_msg.content,
        "timestamp": assistant_msg.timestamp.isoformat(),
      }
    }
