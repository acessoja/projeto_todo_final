# app/main.py
# Serviço 3 – Analisador/Contador de Tarefas
# FastAPI + SQLAlchemy (SQLite em dev, compatível com o banco do Serviço 1)
#
# NOTA IMPORTANTE:
#   Este serviço é SOMENTE LEITURA no banco de tarefas.
#   Ele não cria nem migra tabelas — essa responsabilidade é do Serviço 1 (Prisma).
#   Apenas importamos os models para que o SQLAlchemy saiba mapeá-los.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.models import task  # noqa: F401 — registra o model no metadata
from app.routers import analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Não criamos tabelas aqui — o Serviço 1 (Prisma) é o dono do schema
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "**Serviço 3 – Analisador/Contador de Tarefas**\n\n"
        "Fornece estatísticas agregadas de tarefas por usuário.\n\n"
        "### Endpoint principal\n"
        "- `GET /analytics/{user_id}` → total, concluídas e pendentes\n\n"
        "### Nota\n"
        "Este serviço é **somente leitura**. Operações de escrita são responsabilidade do Serviço 1."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET"],   # Serviço 3 só responde GETs
    allow_headers=["*"],
)

app.include_router(analytics.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
