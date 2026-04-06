from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse

router = APIRouter(prefix="/tasks", tags=["Tarefas"])


@router.post(
    "/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar nova tarefa",
)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
):
    task = Task(
        title=payload.title,
        description=payload.description,
        user_id=payload.user_id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get(
    "/user/{user_id}",
    response_model=TaskListResponse,
    summary="Listar todas as tarefas de um usuário",
)
def list_tasks(
    user_id: int,
    db: Session = Depends(get_db),
):
    tasks = db.query(Task).filter(Task.user_id == user_id).all()
    return TaskListResponse(tasks=tasks, total=len(tasks))


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Buscar tarefa por ID",
)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarefa não encontrada")
    return task


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Atualizar tarefa",
)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarefa não encontrada")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.patch(
    "/{task_id}/complete",
    response_model=TaskResponse,
    summary="Marcar tarefa como concluída",
)
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarefa não encontrada")

    task.completed = True
    db.commit()
    db.refresh(task)
    return task


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Deletar tarefa",
)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarefa não encontrada")

    db.delete(task)
    db.commit()
