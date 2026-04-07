# app/routers/analytics.py
# Analisador de tarefas — fornece estatísticas por usuário
#
# ESTRATÉGIA DE INTEGRAÇÃO:
#   O Serviço 3 lê diretamente do banco de dados compartilhado (SQLite em dev,
#   ou replica de leitura em prod). Ele nunca escreve — só consulta.
#   Isso mantém separação de responsabilidades sem overhead de HTTP extra.
#
#   Alternativa (comentada no final): consumir o endpoint /stats do Serviço 1 via HTTP.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, Integer
from app.core.database import get_db
from app.models.task import Task
from app.schemas.analytics import AnalyticsResponse

router = APIRouter(prefix="/analytics", tags=["Analisador de Tarefas"])


@router.get(
    "/{user_id}",
    response_model=AnalyticsResponse,
    summary="Obter estatísticas das tarefas de um usuário",
    description=(
        "Retorna o total de tarefas, concluídas e pendentes do usuário informado. "
        "Dados são sempre filtrados pelo user_id — nunca mistura usuários."
    ),
)
def get_user_analytics(
    user_id: int,
    db: Session = Depends(get_db),
):
    """
    Retorna estatísticas agregadas das tarefas do usuário.
    Compatível com a saída esperada pelo frontend:
      { usuarioId, total, concluidas, pendentes }
    """
    result = (
        db.query(
            func.count(Task.id).label("total"),
            func.sum(func.cast(Task.completed, Integer)).label("concluidas"),
        )
        .filter(Task.user_id == user_id)
        .one()
    )

    total = result.total or 0
    concluidas = int(result.concluidas or 0)
    pendentes = total - concluidas

    return AnalyticsResponse(
        usuarioId=user_id,
        total=total,
        concluidas=concluidas,
        pendentes=pendentes,
    )
