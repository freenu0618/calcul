"""데이터베이스 모델"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from .database import Base


class UserModel(Base):
    """사용자 모델 (인증용)"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    employees = relationship("EmployeeModel", back_populates="user")
    salary_records = relationship("SalaryRecordModel", back_populates="user")


class EmployeeModel(Base):
    """직원 정보 모델"""
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    dependents_count = Column(Integer, default=1)
    children_under_20 = Column(Integer, default=0)
    employment_type = Column(String(20), default="FULL_TIME")
    company_size = Column(String(20), default="OVER_5")
    scheduled_work_days = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    user = relationship("UserModel", back_populates="employees")
    salary_records = relationship("SalaryRecordModel", back_populates="employee")


class AllowanceTemplateModel(Base):
    """수당 템플릿 모델"""
    __tablename__ = "allowance_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    amount = Column(Integer, default=0)
    is_taxable = Column(Boolean, default=True)
    is_includable_in_minimum_wage = Column(Boolean, default=True)
    is_fixed = Column(Boolean, default=True)
    is_included_in_regular_wage = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class SalaryRecordModel(Base):
    """급여 계산 이력 모델"""
    __tablename__ = "salary_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)

    # 입력 정보
    base_salary = Column(Integer, nullable=False)
    allowances_json = Column(Text, default="[]")  # 수당 목록 JSON (Text 저장)

    # 계산 결과
    total_gross = Column(Integer)  # 총 지급액
    total_deductions = Column(Integer)  # 총 공제액
    net_pay = Column(Integer)  # 실수령액

    # 상세 내역 (JSON as Text)
    calculation_detail = Column(Text, default="{}")

    # 메타데이터
    calculated_at = Column(DateTime, default=datetime.utcnow)
    note = Column(Text, nullable=True)

    # 관계
    user = relationship("UserModel", back_populates="salary_records")
    employee = relationship("EmployeeModel", back_populates="salary_records")

