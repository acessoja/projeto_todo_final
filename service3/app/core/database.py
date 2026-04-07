# app/core/database.py
# Configuração do banco de dados para o Serviço 3
#
# Em desenvolvimento: aponta para o mesmo dev.db do Serviço 1
# Em produção: use uma replica de leitura ou banco separado sincronizado

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    # check_same_thread=False necessário para SQLite em contexto async/multi-thread
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
