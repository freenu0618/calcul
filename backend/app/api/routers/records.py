"""급여 이력 CRUD API 라우터"""
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

from app.db import get_db, SalaryRecordModel, UserModel
from app.core.deps import get_current_user


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


class SalaryRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: Optional[int]
    base_salary: int
    allowances_json: list
    total_gross: int
    total_deductions: int
    net_pay: int
    calculation_detail: dict
    calculated_at: datetime
    note: Optional[str]

    @classmethod
    def model_validate(cls, obj):
        """DB 모델에서 Response로 변환 시 JSON 문자열 파싱"""
        if hasattr(obj, '__dict__'):
            data = obj.__dict__.copy()

            # JSON 문자열을 파이썬 객체로 변환
            if isinstance(data.get('allowances_json'), str):
                data['allowances_json'] = json.loads(data['allowances_json'])
            if isinstance(data.get('calculation_detail'), str):
                data['calculation_detail'] = json.loads(data['calculation_detail'])

            return cls(**data)
        return super().model_validate(obj)


router = APIRouter()


@router.get("", response_model=List[SalaryRecordResponse])
def list_records(
    employee_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """급여 이력 목록 조회 (본인 소유만)"""
    query = db.query(SalaryRecordModel)\
        .filter(SalaryRecordModel.user_id == current_user.id)
    if employee_id:
        query = query.filter(SalaryRecordModel.employee_id == employee_id)
    records = query.order_by(SalaryRecordModel.calculated_at.desc()).offset(skip).limit(limit).all()

    # JSON 문자열을 파싱하여 반환
    return [
        {
            "id": r.id,
            "employee_id": r.employee_id,
            "base_salary": r.base_salary,
            "allowances_json": json.loads(r.allowances_json) if r.allowances_json else [],
            "total_gross": r.total_gross,
            "total_deductions": r.total_deductions,
            "net_pay": r.net_pay,
            "calculation_detail": json.loads(r.calculation_detail) if r.calculation_detail else {},
            "calculated_at": r.calculated_at,
            "note": r.note,
        }
        for r in records
    ]


@router.post("", response_model=SalaryRecordResponse, status_code=status.HTTP_201_CREATED)
def create_record(
    record: SalaryRecordCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """급여 이력 저장"""
    record_dict = record.model_dump()

    # JSON 필드를 문자열로 변환 (DB 저장용)
    if isinstance(record_dict.get("allowances_json"), list):
        record_dict["allowances_json"] = json.dumps(record_dict["allowances_json"], ensure_ascii=False)
    if isinstance(record_dict.get("calculation_detail"), dict):
        record_dict["calculation_detail"] = json.dumps(record_dict["calculation_detail"], ensure_ascii=False)

    db_record = SalaryRecordModel(
        user_id=current_user.id,
        **record_dict
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    # Response용으로 JSON 문자열을 다시 파싱
    response_data = {
        "id": db_record.id,
        "employee_id": db_record.employee_id,
        "base_salary": db_record.base_salary,
        "allowances_json": json.loads(db_record.allowances_json),
        "total_gross": db_record.total_gross,
        "total_deductions": db_record.total_deductions,
        "net_pay": db_record.net_pay,
        "calculation_detail": json.loads(db_record.calculation_detail),
        "calculated_at": db_record.calculated_at,
        "note": db_record.note,
    }
    return response_data


@router.get("/{record_id}", response_model=SalaryRecordResponse)
def get_record(
    record_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """급여 이력 조회 (본인 소유만)"""
    record = db.query(SalaryRecordModel)\
        .filter(SalaryRecordModel.id == record_id)\
        .filter(SalaryRecordModel.user_id == current_user.id)\
        .first()
    if not record:
        raise HTTPException(status_code=404, detail="이력을 찾을 수 없습니다")

    # JSON 문자열을 파싱하여 반환
    return {
        "id": record.id,
        "employee_id": record.employee_id,
        "base_salary": record.base_salary,
        "allowances_json": json.loads(record.allowances_json) if record.allowances_json else [],
        "total_gross": record.total_gross,
        "total_deductions": record.total_deductions,
        "net_pay": record.net_pay,
        "calculation_detail": json.loads(record.calculation_detail) if record.calculation_detail else {},
        "calculated_at": record.calculated_at,
        "note": record.note,
    }


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    record_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """급여 이력 삭제 (본인 소유만)"""
    db_record = db.query(SalaryRecordModel)\
        .filter(SalaryRecordModel.id == record_id)\
        .filter(SalaryRecordModel.user_id == current_user.id)\
        .first()
    if not db_record:
        raise HTTPException(status_code=404, detail="이력을 찾을 수 없습니다")

    db.delete(db_record)
    db.commit()
    return None
