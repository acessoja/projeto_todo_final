from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.task import Task

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/{user_id}")
def get_user_analytics(user_id: int, db: Session = Depends(get_db)):
    total = db.query(func.count(Task.id)).filter(Task.user_id == user_id).scalar() or 0

    concluidas = (
        db.query(func.count(Task.id))
        .filter(Task.user_id == user_id, Task.completed == True)
        .scalar()
        or 0
    )

    pendentes = total - concluidas

    return {
        "usuarioId": user_id,
        "total": total,
        "concluidas": concluidas,
        "pendentes": pendentes,
    }