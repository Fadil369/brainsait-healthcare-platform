import { renderHook } from '@testing-library/react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/stores';

// Mock the app store
jest.mock('@/stores', () => ({
  useAppStore: jest.fn(),
}));

const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;

describe('useTranslation Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return translation function for default namespace', () => {
    mockUseAppStore.mockReturnValue({
      language: 'en',
    } as any);

    const { result } = renderHook(() => useTranslation());

    expect(result.current.t('loading.general')).toBe('Loading...');
    expect(result.current.t('error.general')).toBe('Something went wrong. Please try again.');
  });

  it('should return translation for specific namespace', () => {
    mockUseAppStore.mockReturnValue({
      language: 'en',
    } as any);

    const { result } = renderHook(() => useTranslation('common'));

    expect(result.current.t('loading.general')).toBe('Loading...');
    // Test actual nested keys that exist in the JSON
    expect(result.current.t('categories.all')).toBe('All Products');
  });

  it('should handle Arabic language', () => {
    mockUseAppStore.mockReturnValue({
      language: 'ar',
    } as any);

    const { result } = renderHook(() => useTranslation());

    expect(result.current.t('loading.general')).toBe('تحميل...');
    expect(result.current.t('error.general')).toBe('حدث خطأ ما. يرجى المحاولة مرة أخرى.');
  });

  it('should handle dot-notation keys', () => {
    mockUseAppStore.mockReturnValue({
      language: 'en',
    } as any);

    const { result } = renderHook(() => useTranslation());

    // Test actual nested keys that exist in the JSON
    expect(result.current.t('categories.ai')).toBe('🤖 AI Solutions');
    expect(result.current.t('hero.title')).toBe('Digital Innovation Marketplace');
  });

  it('should handle dot-notation keys in Arabic', () => {
    mockUseAppStore.mockReturnValue({
      language: 'ar',
    } as any);

    const { result } = renderHook(() => useTranslation());

    // Test actual nested keys that exist in the Arabic JSON
    expect(result.current.t('categories.ai')).toBe('🤖 حلول الذكاء الاصطناعي');
    expect(result.current.t('hero.title')).toBe('سوق الابتكار الرقمي');
  });

  it('should return key if translation not found', () => {
    mockUseAppStore.mockReturnValue({
      language: 'en',
    } as any);

    const { result } = renderHook(() => useTranslation());

    expect(result.current.t('nonexistent.key')).toBe('nonexistent.key');
    expect(result.current.t('missing')).toBe('missing');
  });

  it('should handle invalid language gracefully', () => {
    mockUseAppStore.mockReturnValue({
      language: 'fr', // Unsupported language
    } as any);

    const { result } = renderHook(() => useTranslation());

    expect(result.current.t('loading.general')).toBe('loading.general'); // Returns key when no translation found
  });

  it('should handle invalid namespace gracefully', () => {
    mockUseAppStore.mockReturnValue({
      language: 'en',
    } as any);

    const { result } = renderHook(() => useTranslation('nonexistent'));

    expect(result.current.t('loading.general')).toBe('loading.general'); // Returns key when namespace not found
  });

  it('should handle empty key', () => {
    mockUseAppStore.mockReturnValue({
      language: 'en',
    } as any);

    const { result } = renderHook(() => useTranslation());

    expect(result.current.t('')).toBe('');
  });

  it('should handle undefined language', () => {
    mockUseAppStore.mockReturnValue({
      language: undefined,
    } as any);

    const { result } = renderHook(() => useTranslation());

    expect(result.current.t('loading.general')).toBe('loading.general'); // Returns key when language is undefined
  });
});