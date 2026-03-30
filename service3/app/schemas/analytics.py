from pydantic import BaseModel


class AnalyticsResponse(BaseModel):
    usuarioId: int
    total: int
    concluidas: int
    pendentes: int