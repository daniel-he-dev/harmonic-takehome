import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session
from celery.result import AsyncResult

from backend.db import database
from backend.routes.companies import (
    CompanyBatchOutput,
    fetch_companies_with_liked,
)
from backend.queue.tasks import bulk_add_companies


router = APIRouter(
    prefix="/collections",
    tags=["collections"],
)

class CompanyCollectionMetadata(BaseModel):
    id: uuid.UUID
    collection_name: str


class CompanyCollectionOutput(CompanyBatchOutput, CompanyCollectionMetadata):
    pass


@router.get("", response_model=list[CompanyCollectionMetadata])
def get_all_collection_metadata(
    db: Session = Depends(database.get_db),
):
    collections = db.query(database.CompanyCollection).all()

    return [
        CompanyCollectionMetadata(
            id=collection.id,
            collection_name=collection.collection_name,
        )
        for collection in collections
    ]


@router.get("/{collection_id}", response_model=CompanyCollectionOutput)
def get_company_collection_by_id(
    collection_id: uuid.UUID,
    offset: int = Query(
        0, description="The number of items to skip from the beginning"
    ),
    limit: int = Query(10, description="The number of items to fetch"),
    db: Session = Depends(database.get_db),
):
    query = (
        db.query(database.CompanyCollectionAssociation, database.Company)
        .join(database.Company)
        .filter(database.CompanyCollectionAssociation.collection_id == collection_id)
    )

    total_count = query.with_entities(func.count()).scalar()

    results = query.offset(offset).limit(limit).all()
    companies = fetch_companies_with_liked(db, [company.id for _, company in results])

    return CompanyCollectionOutput(
        id=collection_id,
        collection_name=db.query(database.CompanyCollection)
        .get(collection_id)
        .collection_name,
        companies=companies,
        total=total_count,
    )


@router.post("/{collection_id}/add-company", status_code=201)
def add_company_to_collection(
    collection_id: uuid.UUID,
    company_id: str,
    db: Session = Depends(database.get_db)
):
    # Check if the company exists
    company = db.query(database.Company).filter(database.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Check if the collection exists
    collection = db.query(database.CompanyCollection).filter(database.CompanyCollection.id == collection_id).first()
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    # Check if the association already exists
    existing_association = db.query(database.CompanyCollectionAssociation).filter(
        database.CompanyCollectionAssociation.company_id == company_id,
        database.CompanyCollectionAssociation.collection_id == collection_id
    ).first()
    if existing_association:
        raise HTTPException(status_code=400, detail="Company already in collection")

    # Add the company to the collection
    association = database.CompanyCollectionAssociation(
        company_id=company_id,
        collection_id=collection_id
    )
    db.add(association)
    db.commit()

    return {"message": "Company added to collection"}

@router.post("/bulk-add")
def start_bulk_add(source_collection_id: str, target_collection_id: str):
    """
    Starts the bulk add task and returns the task ID for tracking.
    """
    task = bulk_add_companies.delay(source_collection_id, target_collection_id) 
    return {"task_id": task.id}

@router.get("/task-status/{task_id}")
def get_task_status(task_id: str):
    """
    Check the status of the bulk add task.
    """
    task_result = AsyncResult(task_id)
    if task_result.state == "PENDING":
        return {"status": "In Progress"}
    elif task_result.state == "SUCCESS":
        return task_result.result
    else:
        raise HTTPException(status_code=500, detail="Task failed")