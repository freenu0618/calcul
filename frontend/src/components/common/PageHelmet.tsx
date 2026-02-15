/**
 * 페이지별 SEO 메타태그 공통 컴포넌트
 * - title, description, canonical, og, twitter 태그를 페이지별로 고유하게 설정
 */

import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://paytools.work';

interface PageHelmetProps {
  title: string;
  description: string;
  path: string;
}

export default function PageHelmet({ title, description, path }: PageHelmetProps) {
  const url = `${BASE_URL}${path}`;
  const fullTitle = title.includes('PayTools') ? title : `${title} | PayTools`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
