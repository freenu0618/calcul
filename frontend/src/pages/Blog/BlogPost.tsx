/**
 * 개별 블로그 포스트 페이지
 */

import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import { blogPosts } from '../../data/blogPosts';

const BlogPost = () => {
  const { postId } = useParams<{ postId: string }>();

  // 포스트 데이터 가져오기
  const post = postId ? blogPosts[postId] : null;

  // 포스트가 없으면 블로그 목록으로 리다이렉트
  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // 관련 포스트 가져오기
  const relatedPosts = post.relatedPosts
    .map(id => blogPosts[id])
    .filter(Boolean)
    .slice(0, 3);

  return (
    <MainLayout>
      <Helmet>
        <title>{post.title} | 급여계산기</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={post.keywords.join(', ')} />

        {/* Open Graph */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://paytools.work/blog/${post.id}`} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />

        {/* Article Meta */}
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content={post.author} />
        <meta property="article:section" content={post.category} />
        {post.keywords.map(keyword => (
          <meta key={keyword} property="article:tag" content={keyword} />
        ))}
      </Helmet>

      <article className="max-w-4xl mx-auto">
        {/* 브레드크럼 */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">홈</Link>
          <span className="mx-2">/</span>
          <Link to="/blog" className="hover:text-blue-600">블로그</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{post.title}</span>
        </nav>

        {/* 포스트 헤더 */}
        <header className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded">
              {post.category}
            </span>
            <span className="text-sm text-gray-500">{post.date}</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <p className="text-lg text-gray-600 mb-4">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>작성자: {post.author}</span>
          </div>
        </header>

        {/* 포스트 콘텐츠 */}
        <Card className="mb-12">
          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:mb-4 prose-ul:mb-4 prose-ol:mb-4 prose-li:mb-2 prose-table:mb-6 prose-pre:mb-4 prose-blockquote:mb-4">
            {post.content.split('\n').map((line, index) => {
              // 헤딩 처리
              if (line.startsWith('# ')) {
                return <h1 key={index} className="text-3xl font-bold mt-8 mb-4">{line.substring(2)}</h1>;
              }
              if (line.startsWith('## ')) {
                return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{line.substring(3)}</h2>;
              }
              if (line.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-bold mt-6 mb-3">{line.substring(4)}</h3>;
              }

              // 리스트 처리
              if (line.startsWith('- ')) {
                return <li key={index} className="ml-4">{line.substring(2)}</li>;
              }

              // 코드 블록 처리 (간단한 버전)
              if (line.startsWith('```')) {
                return null; // 코드 블록 마커는 렌더링하지 않음
              }
              if (line.startsWith('    ')) {
                return <pre key={index} className="bg-gray-50 p-3 rounded"><code>{line}</code></pre>;
              }

              // 테이블 처리 (마크다운 테이블)
              if (line.includes('|')) {
                const cells = line.split('|').filter(cell => cell.trim());
                return (
                  <tr key={index}>
                    {cells.map((cell, i) => (
                      <td key={i} className="border px-4 py-2">{cell.trim()}</td>
                    ))}
                  </tr>
                );
              }

              // 일반 텍스트
              if (line.trim()) {
                return <p key={index} className="mb-4">{line}</p>;
              }

              return <br key={index} />;
            })}
          </div>
        </Card>

        {/* 관련 포스트 */}
        {relatedPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">관련 글</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} to={`/blog/${relatedPost.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="space-y-3">
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded">
                        {relatedPost.category}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA 섹션 */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-lg text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            정확한 급여 계산이 필요하신가요?
          </h3>
          <p className="text-gray-700 mb-6">
            4대 보험, 소득세, 가산수당을 자동으로 계산해드립니다.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            급여 계산기 사용하기 →
          </Link>
        </div>

        {/* 블로그 목록으로 돌아가기 */}
        <div className="mt-8 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            ← 블로그 목록으로 돌아가기
          </Link>
        </div>
      </article>
    </MainLayout>
  );
};

export default BlogPost;
