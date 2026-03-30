# app/models/task.py
# Model SQLAlchemy mapeado para a tabela "tarefas" do Serviço 1 (Prisma)
#
# ATENÇÃO À COMPATIBILIDADE:
#   O Serviço 1 usa Prisma com SQLite e a tabela se chama "tarefas"
#   com coluna "concluida" (boolean) e "usuarioId" (snake: usuario_id no SQLite).
#   O Serviço 3 lê essa mesma tabela via SQLAlchemy.
#
#   Mapeamento de colunas Prisma → SQLAlchemy:
#     titulo    → title    (mantemos o alias via column)
#     concluida → completed
#     usuarioId → user_id

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class Task(Base):
    # Nome da tabela conforme definido no schema Prisma: @@map("tarefas")
    __tablename__ = "tarefas"

    id = Column(Integer, primary_key=True, index=True)

    # Prisma usa "titulo" — SQLAlchemy mapeia direto
    titulo = Column("titulo", String(255), nullable=False)

    # Prisma usa "concluida" — SQLAlchemy mapeia via alias
    completed = Column("concluida", Boolean, default=False, nullable=False)

    # Prisma usa "usuarioId" armazenado como "usuarioId" no SQLite (camelCase preservado)
    user_id = Column("usuarioId", Integer, nullable=False, index=True)

    def __repr__(self):
        return f"<Task id={self.id} titulo={self.titulo} concluida={self.completed}>"
