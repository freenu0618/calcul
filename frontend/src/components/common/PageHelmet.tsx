/**
 * 페이지별 SEO 메타태그 공통 컴포넌트
 * - title, description, canonical, og, twitter 태그를 페이지별로 고유하게 설정
 */

import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://paytools.work';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.svg`;

interface PageHelmetProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
}

export default function PageHelmet({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  imageAlt = 'PayTools 급여 계산기 미리보기 이미지',
}: PageHelmetProps) {
  const url = `${BASE_URL}${path}`;
  const fullTitle = title.includes('PayTools') ? title : `${title} | PayTools`;
  const imageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="PayTools" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:locale" content="ko_KR" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={imageAlt} />
    </Helmet>
  );
}
