/**
 * 블로그 메인 페이지
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import PageHelmet from '../../components/common/PageHelmet';
import { blogPosts, blogPostPreviews } from '../../data/blogPosts';

const BlogPage = () => {
  const posts = blogPostPreviews;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const filteredPosts = selectedCategory === null
    ? posts
    : posts.filter((post) => post.category === selectedCategory);
  const categories = Array.from(new Set(posts.map(post => post.category)));
  const blogStructuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'PayTools 급여 계산 블로그',
      description: '2026년 급여 계산, 4대보험, 소득세, 최저임금, 주휴수당, 연장·야간·휴일수당 실무 가이드입니다.',
      url: 'https://paytools.work/blog',
      inLanguage: 'ko-KR',
      publisher: {
        '@type': 'Organization',
        name: 'PayTools',
        url: 'https://paytools.work',
        logo: 'https://paytools.work/og-image.png',
      },
      blogPost: posts.map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        url: `https://paytools.work/blog/${post.id}`,
        datePublished: post.date,
        dateModified: post.dateModified,
        inLanguage: 'ko-KR',
        author: {
          '@type': 'Organization',
          name: blogPosts[post.id]?.author ?? 'PayTools',
        },
        publisher: {
          '@type': 'Organization',
          name: 'PayTools',
          url: 'https://paytools.work',
        },
        keywords: blogPosts[post.id]?.keywords.join(', '),
        mainEntityOfPage: `https://paytools.work/blog/${post.id}`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'PayTools 급여 계산 블로그 글 목록',
      url: 'https://paytools.work/blog',
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: post.title,
        url: `https://paytools.work/blog/${post.id}`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '홈',
          item: 'https://paytools.work',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '블로그',
          item: 'https://paytools.work/blog',
        },
      ],
    },
  ];

  return (
    <>
    <PageHelmet
      title="급여 계산 블로그 - 근로법·세법 최신 소식"
      description="급여 계산, 4대보험, 소득세, 연장수당, 최저임금 등 근로 관련 최신 소식과 실무 가이드를 제공합니다."
      path="/blog"
    />
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(blogStructuredData)}
      </script>
    </Helmet>
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            블로그
          </h1>
          <p className="text-lg text-gray-600">
            급여 계산과 근로 관련 최신 소식과 유용한 정보를 제공합니다.
          </p>
        </div>

        {/* 카테고리 */}
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="블로그 카테고리">
          {[null, ...categories].map((category) => (
            <button
              key={category ?? 'all'}
              type="button"
              aria-pressed={selectedCategory === category}
              aria-controls="blog-post-list"
              onClick={() => setSelectedCategory(category)}
              className={`min-h-11 px-4 py-2 rounded-lg text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category ?? '전체'}
            </button>
          ))}
        </div>
        <p className="mb-6 text-sm text-gray-600" role="status" aria-live="polite" aria-atomic="true">
          {selectedCategory ?? '전체'} 글 {filteredPosts.length}개
        </p>

        {/* 블로그 포스트 목록 */}
        <div id="blog-post-list" className="space-y-6">
          {filteredPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded">
                      {post.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {post.dateModified !== post.date ? '수정 ' : '작성 '}
                      <time dateTime={post.dateModified}>{post.dateModified}</time>
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600">
                    {post.excerpt}
                  </p>
                  <span className="inline-block text-blue-600 hover:text-blue-700 font-medium">
                    자세히 읽기 →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* 구독 안내 */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            최신 소식 받아보기
          </h3>
          <p className="text-gray-700 mb-4">
            급여 계산과 근로 관련 최신 정보를 정기적으로 업데이트합니다.
          </p>
          <Link
            to="/contact"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            문의하기
          </Link>
        </div>
      </div>
    </MainLayout>
    </>
  );
};

export default BlogPage;
