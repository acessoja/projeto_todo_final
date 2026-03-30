from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base


class Task(Base):
    __tablename__ = "tarefas"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column("titulo", String(255), nullable=False)
    completed = Column("concluida", Boolean, default=False, nullable=False)
    user_id = Column("usuarioId", Integer, nullable=False, index=True)