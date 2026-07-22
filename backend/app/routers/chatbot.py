from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.chatbot.service import answer_question
from app.database import get_db
from app.models import User
from app.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.post("/ask", response_model=ChatResponse)
def ask_chatbot(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reply = answer_question(db, payload.message)
    return ChatResponse(reply=reply)
