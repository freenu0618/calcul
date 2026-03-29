/**
 * 상세 페이지 경로 표시 컴포넌트
 * - Schema.org BreadcrumbList 구조화 데이터 포함 (SEO)
 */

import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://paytools.work';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.to ? { item: `${SITE_URL}${item.to}` } : {}),
    })),
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
      <nav aria-label="breadcrumb" className="flex items-center gap-1 text-sm text-gray-500 mb-4">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && (
              <span className="material-symbols-outlined text-[16px] text-gray-400" aria-hidden="true">chevron_right</span>
            )}
            {item.to ? (
              <Link to={item.to} className="hover:text-primary-600 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium" aria-current="page">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
