/**
 * 근로계약서 작성 페이지
 */

import { Helmet } from 'react-helmet-async';
import MainLayout from '../../components/layout/MainLayout';
import ContractForm from './ContractForm';

export default function ContractPage() {
  return (
    <>
      <Helmet>
        <title>근로계약서 작성 | Paytools</title>
        <meta
          name="description"
          content="표준근로계약서 양식에 맞춰 근로계약서를 작성하고 PDF로 출력하세요."
        />
      </Helmet>
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            근로계약서 작성
          </h1>
          <p className="text-gray-600 mb-6">
            고용노동부 표준근로계약서 양식에 맞춰 계약서를 작성하세요.
          </p>
          <ContractForm />
        </div>
      </MainLayout>
    </>
  );
}
