import '@testing-library/jest-dom';
import { setupTestEnvironment } from '../utils/testing-helpers';

// Enhanced global test setup
beforeAll(() => {
  // Setup test environment
  const cleanup = setupTestEnvironment();
  
  // Store cleanup function globally for potential use
  (global as any).testCleanup = cleanup;
});

afterAll(() => {
  // Run cleanup if available
  if ((global as any).testCleanup) {
    (global as any).testCleanup();
  }
});

// Mock API base URL for consistent testing
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api';
process.env.NEXT_PUBLIC_USE_MOCK_API = 'true';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    isLocaleDomain: true,
    isReady: true,
    defaultLocale: 'en',
    domainLocales: [],
    isPreview: false,
  }),
}));

// Mock next/navigation for App Router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('div', props, children);
    },
    span: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('span', props, children);
    },
    button: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('button', props, children);
    },
    section: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('section', props, children);
    },
    article: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('article', props, children);
    },
    h1: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('h1', props, children);
    },
    h2: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('h2', props, children);
    },
    h3: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('h3', props, children);
    },
    p: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('p', props, children);
    },
    img: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('img', props, children);
    },
  },
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
  useInView: () => [jest.fn(), true],
  useMotionValue: (initial: any) => ({ get: () => initial, set: jest.fn() }),
  useSpring: (value: any) => value,
  useTransform: (value: any, transformer: any) => transformer ? transformer(value) : value,
}));

// Mock React Query DevTools
jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => null,
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  TrashIcon: (props: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'trash-icon', ...props });
  },
  ShoppingCartIcon: (props: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'shopping-cart-icon', ...props });
  },
  MagnifyingGlassIcon: (props: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'search-icon', ...props });
  },
  Bars3Icon: (props: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'menu-icon', ...props });
  },
  XMarkIcon: (props: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'close-icon', ...props });
  },
  ChevronDownIcon: (props: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'chevron-down-icon', ...props });
  },
  ChevronUpIcon: (props: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'chevron-up-icon', ...props });
  },
}));

jest.mock('@heroicons/react/24/solid', () => ({
  StarIcon: (props: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'star-icon', ...props });
  },
  ShoppingCartIcon: (props: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'shopping-cart-icon-solid', ...props });
  },
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.scrollTo
global.scrollTo = jest.fn();

// Suppress specific warnings in tests
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Suppress React Query warnings in tests
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Query data cannot be undefined') ||
     args[0].includes('Warning: ReactDOM.render is no longer supported'))
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

// Add custom matchers for better testing
expect.extend({
  toBeVisible(received) {
    const pass = received && received.style.display !== 'none' && received.style.visibility !== 'hidden';
    return {
      message: () => `expected element to ${pass ? 'not ' : ''}be visible`,
      pass,
    };
  },
});

// Type augmentation for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeVisible(): R;
    }
  }
}

export {};