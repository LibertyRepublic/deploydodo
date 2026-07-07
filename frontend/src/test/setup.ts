import '@testing-library/jest-dom/vitest';
import 'jest-axe/extend-expect';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: {
      div: 'div',
      span: 'span',
      button: 'button',
      nav: 'nav',
      ul: 'ul',
      li: 'li',
      section: 'section',
      header: 'header',
      main: 'main',
      footer: 'footer',
      aside: 'aside',
      article: 'article',
      a: 'a',
      img: 'img',
      svg: 'svg',
      path: 'path',
      g: 'g',
      circle: 'circle',
      rect: 'rect',
    },
    LayoutGroup: ({ children }: { children: React.ReactNode }) => children,
  };
});
