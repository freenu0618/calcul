/**
 * 근로계약서 작성 폼 (메인)
 */

import { useState } from 'react';
import Card from '../../components/common/Card';
import type { LaborContract } from '../../types/contract';
import { DEFAULT_CONTRACT } from '../../types/contract';
import EmployerSection from './sections/EmployerSection';
import EmployeeSection from './sections/EmployeeSection';
import ContractPeriodSection from './sections/ContractPeriodSection';
import WorkConditionSection from './sections/WorkConditionSection';
import WageSection from './sections/WageSection';
import InsuranceSection from './sections/InsuranceSection';
import { generateContractPdf } from '../../utils/contractPdfGenerator';

export default function ContractForm() {
  const [contract, setContract] = useState<LaborContract>(DEFAULT_CONTRACT);
  const [isGenerating, setIsGenerating] = useState(false);

  const updateContract = (updates: Partial<LaborContract>) => {
    setContract((prev) => ({ ...prev, ...updates }));
  };

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    try {
      await generateContractPdf(contract);
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      alert('PDF 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 사업주 정보 */}
      <Card title="1. 사업주 (갑)">
        <EmployerSection
          employer={contract.employer}
          onChange={(employer) => updateContract({ employer })}
        />
      </Card>

      {/* 근로자 정보 */}
      <Card title="2. 근로자 (을)">
        <EmployeeSection
          employee={contract.employee}
          onChange={(employee) => updateContract({ employee })}
        />
      </Card>

      {/* 계약 기간 */}
      <Card title="3. 계약 기간">
        <ContractPeriodSection
          contract={contract}
          onChange={updateContract}
        />
      </Card>

      {/* 근로 조건 */}
      <Card title="4. 근로 조건">
        <WorkConditionSection
          contract={contract}
          onChange={updateContract}
        />
      </Card>

      {/* 임금 */}
      <Card title="5. 임금">
        <WageSection contract={contract} onChange={updateContract} />
      </Card>

      {/* 4대 보험 */}
      <Card title="6. 4대 보험">
        <InsuranceSection
          insurance={contract.social_insurance}
          onChange={(social_insurance) => updateContract({ social_insurance })}
        />
      </Card>

      {/* 기타 사항 */}
      <Card title="7. 기타 약정사항">
        <textarea
          value={contract.other_terms || ''}
          onChange={(e) => updateContract({ other_terms: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={4}
          placeholder="기타 약정사항을 입력하세요 (선택)"
        />
      </Card>

      {/* PDF 생성 버튼 */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleGeneratePdf}
          disabled={isGenerating}
          className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {isGenerating ? 'PDF 생성 중...' : 'PDF 다운로드'}
        </button>
      </div>

      {/* 법적 고지 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <p className="font-medium mb-1">⚠️ 법적 고지</p>
        <p>
          본 계약서 양식은 참고용이며, 실제 계약 체결 시 노무사 또는 법률 전문가와
          상담하시기 바랍니다. 계약서 내용으로 인한 법적 책임은 당사자에게 있습니다.
        </p>
      </div>
    </div>
  );
}
