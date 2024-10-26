#app/task_queue.py
import os
from celery import Celery


task_manager = Celery(
    "tasks",
    broker=os.getenv("CELERY_BROKER_URL") or "redis://localhost:6379/0",
    backend=os.getenv("CELERY_RESULT_BACKEND") or "redis://localhost:6379/0"
)
task_manager.conf.update(
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    imports=["backend.queue.tasks"]
)

