"""직원 CRUD API 라우터"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.db import get_db, EmployeeModel, UserModel
from app.core.deps import get_current_user


# Pydantic 스키마
class EmployeeCreate(BaseModel):
    name: str
    dependents_count: int = 1
    children_under_20: int = 0
    employment_type: str = "FULL_TIME"
    company_size: str = "OVER_5"
    scheduled_work_days: int = 5


class EmployeeResponse(EmployeeCreate):
    id: int

    class Config:
        from_attributes = True


router = APIRouter()


@router.get("", response_model=List[EmployeeResponse])
def list_employees(
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """직원 목록 조회 (본인 소유만)"""
    employees = db.query(EmployeeModel)\
        .filter(EmployeeModel.user_id == current_user.id)\
        .offset(skip)\
        .limit(limit)\
        .all()
    return employees


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    employee: EmployeeCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """직원 생성"""
    db_employee = EmployeeModel(
        user_id=current_user.id,
        **employee.model_dump()
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """직원 조회 (본인 소유만)"""
    employee = db.query(EmployeeModel)\
        .filter(EmployeeModel.id == employee_id)\
        .filter(EmployeeModel.user_id == current_user.id)\
        .first()
    if not employee:
        raise HTTPException(status_code=404, detail="직원을 찾을 수 없습니다")
    return employee


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    employee: EmployeeCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """직원 수정 (본인 소유만)"""
    db_employee = db.query(EmployeeModel)\
        .filter(EmployeeModel.id == employee_id)\
        .filter(EmployeeModel.user_id == current_user.id)\
        .first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="직원을 찾을 수 없습니다")

    for key, value in employee.model_dump().items():
        setattr(db_employee, key, value)

    db.commit()
    db.refresh(db_employee)
    return db_employee


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    employee_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """직원 삭제 (본인 소유만)"""
    db_employee = db.query(EmployeeModel)\
        .filter(EmployeeModel.id == employee_id)\
        .filter(EmployeeModel.user_id == current_user.id)\
        .first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="직원을 찾을 수 없습니다")

    db.delete(db_employee)
    db.commit()
    return None
