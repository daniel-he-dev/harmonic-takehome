from time import sleep  # For simulating time-consuming tasks
from backend.queue.task_queue import task_manager

@task_manager.task
def bulk_add_companies(source_collection_id, target_collection_id):
    """
    Task to add all of the companies from a source company collection to a target company collection in the database.
    """
    print(f"Starting bulk add task from {source_collection_id} to {target_collection_id}")
    sleep(10)

    return {"status": "completed"}

