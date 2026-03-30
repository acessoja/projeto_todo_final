from app.core.database import Base, engine
from app.models import task

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.routers import analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


Base.metadata.create_all(bind=engine)

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
    allow_methods=["GET"],
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
