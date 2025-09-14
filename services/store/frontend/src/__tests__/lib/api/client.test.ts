import axios, { AxiosResponse, AxiosError } from 'axios';

// Mock axios completely
jest.mock('axios', () => {
  const mockAxiosInstance = {
    request: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  };
  
  // Store instance on module for access in tests
  (global as any).mockAxiosInstance = mockAxiosInstance;
  
  return {
    create: jest.fn(() => mockAxiosInstance),
    isAxiosError: jest.fn((error) => error && error.isAxiosError === true),
    default: {
      create: jest.fn(() => mockAxiosInstance),
      isAxiosError: jest.fn((error) => error && error.isAxiosError === true),
    }
  };
});

import { api, createFormData, createQueryString } from '@/lib/api/client';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('API Client', () => {
  let mockAxiosInstance: any;
  
  beforeAll(() => {
    mockAxiosInstance = (global as any).mockAxiosInstance;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });

  describe('api.get', () => {
    it('should make GET request and return response data', async () => {
      const mockResponseData = { data: { id: 1, name: 'Test' } };
      const mockResponse = { data: mockResponseData } as AxiosResponse;
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const result = await api.get('/test');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/test'
        })
      );
      expect(result).toBe(mockResponseData);
    });

    it('should handle API errors correctly', async () => {
      const axiosError = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { message: 'Resource not found' }
        },
        isAxiosError: true
      } as AxiosError;

      mockAxiosInstance.request.mockRejectedValue(axiosError);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(api.get('/test')).rejects.toThrow('Resource not found');
    });
  });

  describe('api.post', () => {
    it('should make POST request with data', async () => {
      const mockResponseData = { data: { id: 1, created: true } };
      const mockResponse = { data: mockResponseData } as AxiosResponse;
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const postData = { name: 'New Item' };
      const result = await api.post('/test', postData);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/test',
          data: postData
        })
      );
      expect(result).toBe(mockResponseData);
    });
  });

  describe('Helper Functions', () => {
    describe('createFormData', () => {
      it('should create FormData from object', () => {
        const data = {
          name: 'test',
          age: 25,
          active: true
        };

        const formData = createFormData(data);

        expect(formData).toBeInstanceOf(FormData);
        expect(formData.get('name')).toBe('test');
        expect(formData.get('age')).toBe('25');
        expect(formData.get('active')).toBe('true');
      });

      it('should skip null and undefined values', () => {
        const data = {
          name: 'test',
          nullValue: null,
          undefinedValue: undefined,
          emptyString: ''
        };

        const formData = createFormData(data);

        expect(formData.has('name')).toBe(true);
        expect(formData.has('nullValue')).toBe(false);
        expect(formData.has('undefinedValue')).toBe(false);
        expect(formData.has('emptyString')).toBe(true);
      });
    });

    describe('createQueryString', () => {
      it('should create query string from object', () => {
        const params = {
          page: 1,
          limit: 10,
          search: 'test query',
          active: true
        };

        const queryString = createQueryString(params);

        expect(queryString).toContain('page=1');
        expect(queryString).toContain('limit=10');
        expect(queryString).toContain('search=test+query');
        expect(queryString).toContain('active=true');
      });

      it('should skip null and undefined values', () => {
        const params = {
          page: 1,
          nullValue: null,
          undefinedValue: undefined,
          emptyString: '',
          zero: 0,
          false: false
        };

        const queryString = createQueryString(params);

        expect(queryString).toContain('page=1');
        expect(queryString).not.toContain('nullValue');
        expect(queryString).not.toContain('undefinedValue');
        expect(queryString).toContain('emptyString=');
        expect(queryString).toContain('zero=0');
        expect(queryString).toContain('false=false');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const networkError = {
        request: {},
        message: 'Network Error',
        code: 'ECONNREFUSED'
      } as AxiosError;

      mockAxiosInstance.request.mockRejectedValue(networkError);
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(api.get('/test'))
        .rejects.toThrow('Network error. Please check your internet connection.');
    });

    it('should handle unknown errors', async () => {
      const unknownError = {
        message: 'Something went wrong'
      } as AxiosError;

      mockAxiosInstance.request.mockRejectedValue(unknownError);
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(api.get('/test')).rejects.toThrow('Something went wrong');
    });
  });
});