import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import ScrollToTop from '../components/common/ScrollToTop';

const scrollTo = vi.fn();
const scrollIntoView = vi.fn();

function renderPage(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ScrollToTop />
      <Link to="/#pricing">요금제</Link>
      <Link to="/guide">가이드</Link>
      <Routes>
        <Route path="/" element={<section id="pricing">요금제 내용</section>} />
        <Route path="/guide" element={<h1>가이드 내용</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.stubGlobal('scrollTo', scrollTo);
  Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView });
  scrollTo.mockClear();
  scrollIntoView.mockClear();
});

afterEach(() => {
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('fragment navigation', () => {
  it('scrolls to pricing when arriving from another page', async () => {
    renderPage('/guide');
    scrollTo.mockClear();
    await userEvent.click(screen.getByRole('link', { name: '요금제' }));
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
    expect(scrollIntoView.mock.instances[0]).toBe(document.getElementById('pricing'));
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('handles same-page and repeated pricing links', async () => {
    renderPage('/');
    await userEvent.click(screen.getByRole('link', { name: '요금제' }));
    await userEvent.click(screen.getByRole('link', { name: '요금제' }));
    expect(scrollIntoView).toHaveBeenCalledTimes(2);
  });

  it('honors an encoded fragment on initial arrival', () => {
    renderPage('/#%70ricing');
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it.each(['/guide', '/#missing', '/#%invalid'])('safely scrolls to top for %s', (url) => {
    renderPage(url);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('returns to top when leaving a fragment for another page', async () => {
    renderPage('/#pricing');
    await userEvent.click(screen.getByRole('link', { name: '가이드' }));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
