/**
 * 급여명세서 PDF/CSV 내보내기 버튼 컴포넌트
 *
 * 성능 최적화:
 * - html2canvas + jsPDF (350KB) → Dynamic Import로 번들 분리
 * - 사용자가 버튼 클릭 시에만 라이브러리 로드
 */

import { useState } from 'react';
import { useToast } from '../common/Toast';
import type { SalaryCalculationResponse } from '../../types/salary';

interface PDFExportProps {
  result: SalaryCalculationResponse;
  employerName?: string;
  variant?: 'default' | 'compact';
}

export default function PDFExport({
  result,
  employerName = 'PayTools 사업장',
  variant = 'default',
}: PDFExportProps) {
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePdfDownload = async () => {
    setIsGenerating(true);
    try {
      // Dynamic Import: 사용자가 버튼 클릭 시에만 라이브러리 로드
      const { generatePayslipPdf } = await import('../../utils/pdfGenerator');
      await generatePayslipPdf(result, employerName);
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      showToast('error', 'PDF 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCsvDownload = async () => {
    try {
      // Dynamic Import: CSV도 동일하게 분리
      const { exportSalaryToCsv } = await import('../../utils/pdfGenerator');
      exportSalaryToCsv(result);
    } catch (error) {
      console.error('CSV 내보내기 실패:', error);
      showToast('error', 'CSV 내보내기에 실패했습니다.');
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex gap-2">
        <button
          onClick={handlePdfDownload}
          disabled={isGenerating}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary-600 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
          {isGenerating ? '생성 중...' : 'PDF'}
        </button>
        <button
          onClick={handleCsvDownload}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
        >
          <span className="material-symbols-outlined text-[16px]">table_view</span>
          CSV
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={handlePdfDownload}
        disabled={isGenerating}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
      >
        <span className="material-symbols-outlined">picture_as_pdf</span>
        {isGenerating ? 'PDF 생성 중...' : '급여명세서 PDF 다운로드'}
      </button>
      <button
        onClick={handleCsvDownload}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
      >
        <span className="material-symbols-outlined">table_view</span>
        Excel/CSV 다운로드
      </button>
    </div>
  );
}
