import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { CartItem, CartTotals, Product } from '@/types';

// Enhanced cart analytics interface
interface CartAnalytics {
  totalInteractions: number;
  averageSessionValue: number;
  itemsAddedCount: number;
  itemsRemovedCount: number;
  checkoutAttempts: number;
}

interface CartState {
  // Cart data
  items: CartItem[];
  totals: CartTotals;
  isOpen: boolean;
  
  // UI states
  isLoading: boolean;
  error?: string;
  
  // Enhanced analytics
  analytics: CartAnalytics;
  lastUpdated: number;
  sessionId: string;
  
  // Actions
  addItem: (product: Product, _quantity?: number) => void;
  removeItem: (_productId: number) => void;
  updateQuantity: (_productId: number, _quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  openCart: () => void;
  
  // Enhanced actions
  incrementCheckoutAttempts: () => void;
  getCartSummary: () => string;
  validateCart: () => { valid: boolean; errors: string[] };
  
  // Private methods
  calculateTotals: () => void;
  updateAnalytics: (action: string) => void;
  generateSessionId: () => string;
}

// VAT rate for Saudi Arabia
const VAT_RATE = 0.15;

export const useCartStore = create<CartState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        items: [],
        totals: {
          subtotal: 0,
          tax: 0,
          total: 0,
          itemCount: 0,
        },
        isOpen: false,
        isLoading: false,
        error: undefined,
        analytics: {
          totalInteractions: 0,
          averageSessionValue: 0,
          itemsAddedCount: 0,
          itemsRemovedCount: 0,
          checkoutAttempts: 0,
        },
        lastUpdated: Date.now(),
        sessionId: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      
      // Actions
      addItem: (product: Product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find(item => item.productId === product.id);
        
        if (existingItem) {
          // Update quantity if item already exists
          get().updateQuantity(product.id, existingItem.quantity + quantity);
        } else {
          // Add new item
          const newItem: CartItem = {
            id: Math.random(), // Generate unique cart item ID
            productId: product.id,
            title: product.title,
            arabicTitle: product.arabicTitle,
            price: product.price,
            quantity,
            icon: product.icon,
          };
          
          set((state) => ({
            items: [...state.items, newItem],
            error: undefined,
          }));
        }
        
        get().calculateTotals();
        get().updateAnalytics('add_item');
      },
      
      removeItem: (productId: number) => {
        set((state) => ({
          items: state.items.filter(item => item.productId !== productId),
          error: undefined,
        }));
        
        get().calculateTotals();
        get().updateAnalytics('remove_item');
      },
      
      updateQuantity: (productId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          ),
          error: undefined,
        }));
        
        get().calculateTotals();
      },
      
      clearCart: () => {
        set({
          items: [],
          totals: {
            subtotal: 0,
            tax: 0,
            total: 0,
            itemCount: 0,
          },
          error: undefined,
        });
      },
      
      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },
      
      closeCart: () => {
        set({ isOpen: false });
      },
      
      openCart: () => {
        set({ isOpen: true });
      },
      
      calculateTotals: () => {
        const { items } = get();
        
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * VAT_RATE;
        const total = subtotal + tax;
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        
        set({
          totals: {
            subtotal,
            tax,
            total,
            itemCount,
          }
        });
        
        get().updateAnalytics('calculate_totals');
      },

      // Enhanced actions
      generateSessionId: () => {
        return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      },

      updateAnalytics: (action: string) => {
        set((state) => ({
          analytics: {
            ...state.analytics,
            totalInteractions: state.analytics.totalInteractions + 1,
            ...(action === 'add_item' && { itemsAddedCount: state.analytics.itemsAddedCount + 1 }),
            ...(action === 'remove_item' && { itemsRemovedCount: state.analytics.itemsRemovedCount + 1 }),
            ...(action === 'checkout_attempt' && { checkoutAttempts: state.analytics.checkoutAttempts + 1 }),
          },
          lastUpdated: Date.now(),
        }));
      },

      incrementCheckoutAttempts: () => {
        get().updateAnalytics('checkout_attempt');
      },

      getCartSummary: () => {
        const { items, totals } = get();
        const itemCount = items.length;
        const uniqueCategories = new Set(items.map(item => 'category' in item ? item.category : 'unknown')).size;
        
        return `Cart: ${itemCount} items, ${uniqueCategories} categories, Total: ${totals.total} SAR`;
      },

      validateCart: () => {
        const { items } = get();
        const errors: string[] = [];
        
        if (items.length === 0) {
          errors.push('Cart is empty');
        }
        
        // Check for invalid quantities
        const invalidItems = items.filter(item => item.quantity <= 0);
        if (invalidItems.length > 0) {
          errors.push('Some items have invalid quantities');
        }
        
        // Check for invalid prices
        const invalidPrices = items.filter(item => item.price <= 0);
        if (invalidPrices.length > 0) {
          errors.push('Some items have invalid prices');
        }
        
        return {
          valid: errors.length === 0,
          errors,
        };
      },
    }),
    {
      name: 'brainsait-cart-store',
      partialize: (state) => ({
        items: state.items,
        totals: state.totals,
        analytics: state.analytics,
        sessionId: state.sessionId,
      }),
      onRehydrateStorage: () => (state) => {
        // Recalculate totals and generate new session ID after rehydration
        if (state) {
          state.calculateTotals();
          if (!state.sessionId) {
            state.sessionId = state.generateSessionId();
          }
        }
      },
    })
  )
);

// Selector hooks for optimized re-renders
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartTotals = () => useCartStore((state) => state.totals);
export const useCartItemCount = () => useCartStore((state) => state.totals.itemCount);
export const useIsCartOpen = () => useCartStore((state) => state.isOpen);
export const useCartLoading = () => useCartStore((state) => state.isLoading);
export const useCartError = () => useCartStore((state) => state.error);

// Computed selectors
export const useIsCartEmpty = () => useCartStore((state) => state.items.length === 0);
export const useCartTotal = () => useCartStore((state) => state.totals.total);

// Helper functions for cart operations
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatPriceEnglish = (price: number): string => {
  return `${price.toLocaleString()} SAR`;
};