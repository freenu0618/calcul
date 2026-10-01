import { render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import BlogPost from '../pages/Blog/BlogPost';
import { blogPosts } from '../data/blogPosts';

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

function renderArticle(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <LocationProbe />
        <Routes>
          <Route path="/blog/:postId" element={<BlogPost />} />
          <Route path="/blog" element={<p>Blog index redirect</p>} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('blog article recovery', () => {
  it('keeps a missing article URL and provides noindex recovery links', async () => {
    const path = '/blog/missing-article-regression-check';
    renderArticle(path);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('페이지를 찾을 수 없습니다');
    expect(screen.getByTestId('location')).toHaveTextContent(path);
    expect(screen.getByRole('link', { name: '블로그 목록' })).toHaveAttribute('href', '/blog');
    expect(screen.getByRole('link', { name: '급여 계산기' })).toHaveAttribute('href', '/calculator');
    await waitFor(() => {
      expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    });
  });

  it('continues to render an existing article with its canonical URL', async () => {
    const post = Object.values(blogPosts)[0];
    renderArticle(`/blog/${post.id}`);

    expect(screen.getByRole('heading', { level: 1, name: post.title })).toHaveTextContent(post.title);
    await waitFor(() => {
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', `https://paytools.work/blog/${post.id}`);
      expect(document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '').not.toContain('noindex');
    });
  });
});
