"""Employee Entity 테스트"""
import pytest
from app.domain.entities.employee import Employee, EmploymentType, CompanySize


class TestEmployeeCreation:
    """Employee 객체 생성 테스트"""

    def test_create_employee(self):
        """정상 생성"""
        employee = Employee(
            name="홍길동",
            dependents_count=2,
            children_under_20=1,
            employment_type=EmploymentType.FULL_TIME,
            company_size=CompanySize.OVER_5
        )
        assert employee.name == "홍길동"
        assert employee.dependents_count == 2
        assert employee.children_under_20 == 1
        assert employee.employment_type == EmploymentType.FULL_TIME
        assert employee.company_size == CompanySize.OVER_5
        assert employee.id is not None

    def test_auto_generate_id(self):
        """ID 자동 생성"""
        employee1 = Employee(
            name="홍길동",
            dependents_count=0,
            children_under_20=0,
            employment_type=EmploymentType.FULL_TIME,
            company_size=CompanySize.OVER_5
        )
        employee2 = Employee(
            name="김철수",
            dependents_count=0,
            children_under_20=0,
            employment_type=EmploymentType.FULL_TIME,
            company_size=CompanySize.OVER_5
        )
        assert employee1.id != employee2.id


class TestEmployeeValidation:
    """Employee 검증 테스트"""

    def test_negative_dependents_count(self):
        """음수 부양가족 수 오류"""
        with pytest.raises(ValueError, match="Dependents count cannot be negative"):
            Employee(
                name="홍길동",
                dependents_count=-1,
                children_under_20=0,
                employment_type=EmploymentType.FULL_TIME,
                company_size=CompanySize.OVER_5
            )

    def test_negative_children_under_20(self):
        """음수 20세 이하 자녀 수 오류"""
        with pytest.raises(ValueError, match="Children under 20 cannot be negative"):
            Employee(
                name="홍길동",
                dependents_count=2,
                children_under_20=-1,
                employment_type=EmploymentType.FULL_TIME,
                company_size=CompanySize.OVER_5
            )

    def test_children_exceed_dependents(self):
        """자녀 수가 부양가족 수 초과 오류"""
        with pytest.raises(ValueError, match="Children under 20.*cannot exceed.*dependents count"):
            Employee(
                name="홍길동",
                dependents_count=1,
                children_under_20=2,
                employment_type=EmploymentType.FULL_TIME,
                company_size=CompanySize.OVER_5
            )


class TestEmploymentType:
    """고용 형태 확인 테스트"""

    def test_is_full_time(self):
        """정규직 확인"""
        employee = Employee(
            name="홍길동",
            dependents_count=0,
            children_under_20=0,
            employment_type=EmploymentType.FULL_TIME,
            company_size=CompanySize.OVER_5
        )
        assert employee.is_full_time()
        assert not employee.is_part_time()

    def test_is_part_time(self):
        """파트타임 확인"""
        employee = Employee(
            name="김철수",
            dependents_count=0,
            children_under_20=0,
            employment_type=EmploymentType.PART_TIME,
            company_size=CompanySize.UNDER_5
        )
        assert employee.is_part_time()
        assert not employee.is_full_time()


class TestCompanySize:
    """사업장 규모 확인 테스트"""

    def test_is_large_company(self):
        """5인 이상 사업장 확인"""
        employee = Employee(
            name="홍길동",
            dependents_count=0,
            children_under_20=0,
            employment_type=EmploymentType.FULL_TIME,
            company_size=CompanySize.OVER_5
        )
        assert employee.is_large_company()
        assert not employee.is_small_company()

    def test_is_small_company(self):
        """5인 미만 사업장 확인"""
        employee = Employee(
            name="김철수",
            dependents_count=0,
            children_under_20=0,
            employment_type=EmploymentType.PART_TIME,
            company_size=CompanySize.UNDER_5
        )
        assert employee.is_small_company()
        assert not employee.is_large_company()
