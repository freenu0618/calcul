import { fireEvent, render, screen, within } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import BlogPage from '../pages/Blog/BlogPage';
import { blogPostPreviews } from '../data/blogPosts';

describe('blog category navigation', () => {
  it('filters article links by category and restores all articles', () => {
    render(<HelmetProvider><MemoryRouter><BlogPage /></MemoryRouter></HelmetProvider>);
    const group = screen.getByRole('group', { name: '블로그 카테고리' });
    const allButton = within(group).getByRole('button', { name: '전체' });
    expect(allButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent(`전체 글 ${blogPostPreviews.length}개`);

    for (const category of new Set(blogPostPreviews.map((post) => post.category))) {
      const button = within(group).getByRole('button', { name: category });
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(allButton).toHaveAttribute('aria-pressed', 'false');
      const expected = blogPostPreviews.filter((post) => post.category === category);
      expect(screen.getByRole('status')).toHaveTextContent(`${category} 글 ${expected.length}개`);
      for (const post of blogPostPreviews) {
        const heading = screen.queryByRole('heading', { name: post.title });
        if (post.category === category) {
          expect(heading?.closest('a')).toHaveAttribute('href', `/blog/${post.id}`);
        } else {
          expect(heading).not.toBeInTheDocument();
        }
      }
    }

    fireEvent.click(allButton);
    expect(allButton).toHaveAttribute('aria-pressed', 'true');
    for (const post of blogPostPreviews) {
      expect(screen.getByRole('heading', { name: post.title })).toBeInTheDocument();
    }
  });
});
