from time import sleep  # For simulating time-consuming tasks
from backend.queue.task_queue import task_manager
from sqlalchemy.orm import Session


@task_manager.task
def bulk_add_companies( source_collection_id: str, target_collection_id: str):
  """
  Task to add all of the companies from a source company collection to a target company collection in the database.
  """
  print(f"Adding companies from collection {source_collection_id} to collection {target_collection_id}...")
  from backend.db import database
  db = next(database.get_db())

  # Fetch the source and target collections
  source_query = (
        db.query(database.CompanyCollectionAssociation)
        .filter(database.CompanyCollectionAssociation.collection_id == source_collection_id)
    )
  source_companies = source_query.all()

  target_query = (
    db.query(database.CompanyCollectionAssociation)
        .filter(database.CompanyCollectionAssociation.collection_id == target_collection_id)
  )
  target_existing_company_ids = {association.company_id for association in target_query.all()}

  # Save new associations. Filter out duplicates.
  new_associations = [
      database.CompanyCollectionAssociation(
          company_id=association.company_id, collection_id=target_collection_id
      )
      for association in source_companies if association.company_id not in target_existing_company_ids
  ]
  db.bulk_save_objects(new_associations)
  db.commit()

  return {"status": "completed"}

