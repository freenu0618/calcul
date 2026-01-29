/**
 * 급여명세서 PDF/CSV 내보내기 버튼 컴포넌트
 */

import { useState } from 'react';
import type { SalaryCalculationResponse } from '../../types/salary';
import { generatePayslipPdf, exportSalaryToCsv } from '../../utils/pdfGenerator';

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
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePdfDownload = async () => {
    setIsGenerating(true);
    try {
      await generatePayslipPdf(result, employerName);
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      alert('PDF 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCsvDownload = () => {
    try {
      exportSalaryToCsv(result);
    } catch (error) {
      console.error('CSV 내보내기 실패:', error);
      alert('CSV 내보내기에 실패했습니다.');
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
