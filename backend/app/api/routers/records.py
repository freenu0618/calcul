"""급여 이력 CRUD API 라우터"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.db import get_db, SalaryRecordModel


# Pydantic 스키마
class SalaryRecordCreate(BaseModel):
    employee_id: Optional[int] = None
    base_salary: int
    allowances_json: list = []
    total_gross: int
    total_deductions: int
    net_pay: int
    calculation_detail: dict = {}
    note: Optional[str] = None


class SalaryRecordResponse(SalaryRecordCreate):
    id: int
    calculated_at: datetime

    class Config:
        from_attributes = True


router = APIRouter()


@router.get("", response_model=List[SalaryRecordResponse])
def list_records(
    employee_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """급여 이력 목록 조회"""
    query = db.query(SalaryRecordModel)
    if employee_id:
        query = query.filter(SalaryRecordModel.employee_id == employee_id)
    records = query.order_by(SalaryRecordModel.calculated_at.desc()).offset(skip).limit(limit).all()
    return records


@router.post("", response_model=SalaryRecordResponse, status_code=status.HTTP_201_CREATED)
def create_record(record: SalaryRecordCreate, db: Session = Depends(get_db)):
    """급여 이력 저장"""
    db_record = SalaryRecordModel(**record.model_dump())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record


@router.get("/{record_id}", response_model=SalaryRecordResponse)
def get_record(record_id: int, db: Session = Depends(get_db)):
    """급여 이력 조회"""
    record = db.query(SalaryRecordModel).filter(SalaryRecordModel.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="이력을 찾을 수 없습니다")
    return record


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(record_id: int, db: Session = Depends(get_db)):
    """급여 이력 삭제"""
    db_record = db.query(SalaryRecordModel).filter(SalaryRecordModel.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="이력을 찾을 수 없습니다")
    
    db.delete(db_record)
    db.commit()
    return None
