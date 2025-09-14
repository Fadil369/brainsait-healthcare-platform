import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';

// Mock i18n setup for tests
const createMockI18n = () => {
  const mockI18n = {
    language: 'en',
    languages: ['en', 'ar'],
    changeLanguage: jest.fn().mockResolvedValue(undefined),
    t: jest.fn((key: string) => key),
    exists: jest.fn().mockReturnValue(true),
    getDataByLanguage: jest.fn(),
    getResourceBundle: jest.fn(),
    hasResourceBundle: jest.fn(),
    addResourceBundle: jest.fn(),
    addResource: jest.fn(),
    addResources: jest.fn(),
    removeResourceBundle: jest.fn(),
    loadNamespaces: jest.fn(),
    loadLanguages: jest.fn(),
    reloadResources: jest.fn(),
    setDefaultNamespace: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
    on: jest.fn(),
    options: {},
    services: {
      resourceStore: {
        data: {
          en: {
            common: {
              'cart.title': 'Shopping Cart',
              'cart.empty': 'Your cart is empty',
              'cart.subtotal': 'Subtotal',
              'cart.vat': 'VAT (15%)',
              'cart.total': 'Total',
              'cart.checkout': 'Proceed to Checkout',
            }
          },
          ar: {
            common: {
              'cart.title': 'سلة التسوق',
              'cart.empty': 'السلة فارغة',
              'cart.subtotal': 'المجموع الفرعي',
              'cart.vat': 'ضريبة القيمة المضافة (15%)',
              'cart.total': 'المجموع الإجمالي',
              'cart.checkout': 'إتمام الشراء',
            }
          }
        }
      }
    },
    isInitialized: true,
    initializedStoreOnce: true,
    isInitializing: false,
  } as any;
  
  return mockI18n;
};

// Enhanced test query client with better defaults
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
};

// All providers wrapper for testing
interface AllTheProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
  language?: 'en' | 'ar';
}

const AllTheProviders = ({ 
  children, 
  queryClient: customQueryClient,
  language = 'en'
}: AllTheProvidersProps) => {
  const queryClient = customQueryClient || createTestQueryClient();
  const mockI18n = createMockI18n();
  mockI18n.language = language;
  
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={mockI18n}>
        {children}
      </I18nextProvider>
    </QueryClientProvider>
  );
};

// Custom render function with providers
export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  language?: 'en' | 'ar';
}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { queryClient, language, ...renderOptions } = options;
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders queryClient={queryClient} language={language}>
      {children}
    </AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock product data for consistent testing
export const mockProduct = {
  id: 1,
  title: 'Test Product',
  arabicTitle: 'منتج تجريبي',
  description: 'A test product description',
  arabicDescription: 'وصف منتج تجريبي',
  price: 100,
  originalPrice: 120,
  category: 'ai' as const,
  icon: '🤖',
  features: ['Feature 1', 'Feature 2'],
  arabicFeatures: ['ميزة 1', 'ميزة 2'],
  badge: 'NEW' as const,
  rating: 4.5,
  reviewCount: 10,
  isNew: true,
  isPopular: false,
  isFeatured: true,
};

export const mockCartItem = {
  id: Math.random(),
  productId: mockProduct.id,
  title: mockProduct.title,
  arabicTitle: mockProduct.arabicTitle,
  price: mockProduct.price,
  quantity: 1,
  icon: mockProduct.icon,
};

// Mock API responses
export const mockApiResponse = <T>(data: T) => ({
  success: true,
  data,
  message: 'Success',
  meta: {
    timestamp: new Date().toISOString(),
    requestId: 'test-request-id',
  },
});

export const mockPaginatedResponse = <T>(data: T[], page = 1, limit = 10) => ({
  data,
  pagination: {
    page,
    limit,
    total: data.length,
    totalPages: Math.ceil(data.length / limit),
  },
});

// Test user interactions helpers
export const createMockEvent = (overrides: Partial<Event> = {}) => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  target: { value: '' },
  currentTarget: { value: '' },
  ...overrides,
});

// Wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock window functions
export const mockWindowFunction = (name: string, implementation: any) => {
  const original = (window as any)[name];
  (window as any)[name] = implementation;
  
  return () => {
    (window as any)[name] = original;
  };
};

// Mock localStorage for Zustand persistence
export const createMockStorage = () => {
  const storage: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => storage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete storage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
    length: 0,
    key: jest.fn(),
  };
};

// Global test setup helper
export const setupTestEnvironment = () => {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock localStorage
  const mockStorage = createMockStorage();
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
  });

  // Mock console methods to reduce noise in tests
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = jest.fn();
  console.warn = jest.fn();
  
  return () => {
    console.error = originalError;
    console.warn = originalWarn;
  };
};

// Error boundary for testing
export class TestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Test Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Something went wrong.</div>;
    }

    return this.props.children;
  }
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Test to prevent "no tests" error
describe('Testing Helpers', () => {
  it('should export testing utilities', () => {
    expect(renderWithProviders).toBeDefined();
    expect(createTestQueryClient).toBeDefined();
    expect(mockProduct).toBeDefined();
    expect(mockCartItem).toBeDefined();
  });
});