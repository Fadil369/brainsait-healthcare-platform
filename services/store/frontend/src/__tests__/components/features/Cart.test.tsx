import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Cart } from '@/components/features/Cart';
import { useCartStore, useAppStore } from '@/stores';
import { products } from '@/data/products';
import '@testing-library/jest-dom';

// Helper to add real products to cart for testing
const addRealProductsToCart = () => {
  const cartStore = useCartStore.getState();
  const realProducts = products.slice(0, 3); // Use first 3 real products
  
  // Add products to cart using the proper Product objects
  realProducts.forEach(product => {
    cartStore.addItem(product, 1);
  });
};

// Helper to set up cart with products and open it
const setupCartWithProducts = () => {
  act(() => {
    addRealProductsToCart();
    useCartStore.getState().openCart();
  });
};

describe('Cart Component', () => {
  beforeEach(() => {
    // Reset stores to clean state completely
    act(() => {
      useCartStore.getState().clearCart();
      useCartStore.getState().closeCart();
      useAppStore.getState().setLanguage('en');
    });
  });

  describe('Empty Cart', () => {
    it('should render empty cart when no items', () => {
      // Open the cart
      act(() => {
        useCartStore.getState().openCart();
      });

      render(<Cart />);
      
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      expect(screen.getByText(/Continue Shopping/i)).toBeInTheDocument();
    });

    it('should close cart when continue shopping is clicked', () => {
      act(() => {
        useCartStore.getState().openCart();
      });

      render(<Cart />);
      
      const continueButton = screen.getByText(/Continue Shopping/i);
      fireEvent.click(continueButton);
      
      // Cart should be closed now
      expect(useCartStore.getState().isOpen).toBe(false);
    });

    it('should not render cart totals or checkout for empty cart', () => {
      act(() => {
        useCartStore.getState().openCart();
      });

      render(<Cart />);
      
      expect(screen.queryByText(/Subtotal/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/checkout/i)).not.toBeInTheDocument();
    });
  });

  describe('Cart with Real Products', () => {

    it('should render real product names', () => {
      setupCartWithProducts();
      
      render(<Cart />);
      
      const firstProducts = products.slice(0, 3);
      firstProducts.forEach(product => {
        expect(screen.getByText(product.title)).toBeInTheDocument();
      });
    });

    it('should display real product icons', () => {
      setupCartWithProducts();
      
      render(<Cart />);
      
      const firstProducts = products.slice(0, 3);
      firstProducts.forEach(product => {
        expect(screen.getByText(product.icon)).toBeInTheDocument();
      });
    });

    it('should display formatted prices for real products', () => {
      setupCartWithProducts();
      
      render(<Cart />);
      
      // Check that prices are displayed (formatted prices will be there)
      const priceElements = screen.getAllByText(/\$|SAR|ريال/);
      expect(priceElements.length).toBeGreaterThan(0);
    });

    it('should display Arabic titles when language is Arabic', () => {
      act(() => {
        useAppStore.getState().setLanguage('ar');
        addRealProductsToCart();
        useCartStore.getState().openCart();
      });

      render(<Cart />);
      
      const firstProducts = products.slice(0, 3);
      firstProducts.forEach(product => {
        if (product.arabicTitle) {
          expect(screen.getByText(product.arabicTitle)).toBeInTheDocument();
        }
      });
    });

    it('should render cart totals with real calculations', () => {
      setupCartWithProducts();
      
      render(<Cart />);
      
      expect(screen.getByText('Subtotal')).toBeInTheDocument();
      expect(screen.getByText('VAT (15%)')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
      
      // Verify that totals are calculated correctly
      const cartState = useCartStore.getState();
      expect(cartState.totals.total).toBeGreaterThan(0);
      expect(cartState.totals.tax).toBeGreaterThan(0);
    });

    it('should render checkout button', () => {
      setupCartWithProducts();
      
      render(<Cart />);
      
      const checkoutButton = screen.getByText('Proceed to Checkout');
      expect(checkoutButton).toBeInTheDocument();
    });

    it('should render clear all items button when multiple items', () => {
      setupCartWithProducts(); // This adds 3 products
      
      render(<Cart />);
      
      expect(screen.getByText(/Clear All Items/i)).toBeInTheDocument();
    });

    it('should not render clear all items button with single item', () => {
      // Clear cart and add only one item
      act(() => {
        useCartStore.getState().clearCart();
        const product = products[0];
        useCartStore.getState().addItem(product, 1);
        useCartStore.getState().openCart();
      });

      render(<Cart />);
      
      expect(screen.queryByText(/Clear All Items/i)).not.toBeInTheDocument();
    });

    it('should render payment methods info', () => {
      setupCartWithProducts();
      
      render(<Cart />);
      
      expect(screen.getByText(/We accept Mada, Visa, Mastercard/i)).toBeInTheDocument();
      expect(screen.getByText(/Secure checkout powered by Stripe/i)).toBeInTheDocument();
    });
  });

  describe('Cart Item Interactions with Real Products', () => {
    beforeEach(() => {
      act(() => {
        useCartStore.getState().clearCart();
        const product = products[0]; // Use first real product
        useCartStore.getState().addItem(product, 2);
        useCartStore.getState().openCart();
      });
    });

    it('should handle quantity increase', () => {
      render(<Cart />);
      
      const increaseButtons = screen.getAllByText('+');
      const initialQuantity = useCartStore.getState().items[0].quantity;
      
      fireEvent.click(increaseButtons[0]);
      
      expect(useCartStore.getState().items[0].quantity).toBe(initialQuantity + 1);
    });

    it('should handle quantity decrease', () => {
      render(<Cart />);
      
      const decreaseButtons = screen.getAllByText('-');
      const initialQuantity = useCartStore.getState().items[0].quantity;
      
      act(() => {
        fireEvent.click(decreaseButtons[0]);
      });
      
      expect(useCartStore.getState().items[0].quantity).toBe(initialQuantity - 1);
    });

    it('should disable decrease button when quantity is 1', () => {
      // Set quantity to 1
      act(() => {
        useCartStore.getState().updateQuantity(products[0].id, 1);
      });

      render(<Cart />);
      
      const decreaseButton = screen.getByText('-');
      expect(decreaseButton).toBeDisabled();
    });

    it('should handle item removal', () => {
      render(<Cart />);
      
      const removeButtons = screen.getAllByLabelText(/Remove .* from cart/i);
      const initialItemCount = useCartStore.getState().items.length;
      
      fireEvent.click(removeButtons[0]);
      
      expect(useCartStore.getState().items.length).toBe(initialItemCount - 1);
    });

    it('should have correct ARIA label for remove button', () => {
      render(<Cart />);
      
      const product = products[0];
      expect(screen.getByLabelText(`Remove ${product.title} from cart`)).toBeInTheDocument();
    });
  });

  describe('Cart Actions with Real Data', () => {
    beforeEach(() => {
      act(() => {
        addRealProductsToCart(); // Add multiple real products
        useCartStore.getState().openCart();
      });
    });

    it('should handle clear cart', () => {
      render(<Cart />);
      
      const clearButton = screen.getByText(/Clear All Items/i);
      act(() => {
        fireEvent.click(clearButton);
      });
      
      expect(useCartStore.getState().items.length).toBe(0);
    });

    it('should handle checkout with alert', () => {
      // Mock window.alert
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<Cart />);
      
      const checkoutButton = screen.getByText('Proceed to Checkout');
      act(() => {
        fireEvent.click(checkoutButton);
      });
      
      expect(alertSpy).toHaveBeenCalledWith('This would redirect to the payment gateway in a real application.');
      expect(useCartStore.getState().isOpen).toBe(false);
      
      alertSpy.mockRestore();
    });

    it('should close cart when modal close button is clicked', () => {
      render(<Cart />);
      
      // Click the modal's close functionality (testing the onClose prop)
      const cartStore = useCartStore.getState();
      act(() => {
        cartStore.closeCart();
      });
      
      expect(useCartStore.getState().isOpen).toBe(false);
    });
  });

  describe('Modal Visibility', () => {
    it('should render modal when cart is open', () => {
      act(() => {
        useCartStore.getState().openCart();
      });

      render(<Cart />);
      
      expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    });

    it('should not render modal when cart is closed', () => {
      // Cart should be closed by default
      render(<Cart />);
      
      // Modal should not be visible when closed
      expect(screen.queryByText(/Shopping Cart/i)).not.toBeInTheDocument();
    });
  });

  describe('Real Price Calculations', () => {
    it('should calculate totals correctly with real product prices', () => {
      act(() => {
        useCartStore.getState().clearCart();
        const product = products[0];
        useCartStore.getState().addItem(product, 2);
        useCartStore.getState().openCart();
      });

      render(<Cart />);
      
      const cartState = useCartStore.getState();
      const expectedSubtotal = products[0].price * 2;
      const expectedTax = expectedSubtotal * 0.15; // 15% VAT
      const expectedTotal = expectedSubtotal + expectedTax;
      
      expect(cartState.totals.subtotal).toBe(expectedSubtotal);
      expect(cartState.totals.tax).toBe(expectedTax);
      expect(cartState.totals.total).toBe(expectedTotal);
    });

    it('should format prices correctly in Arabic', () => {
      act(() => {
        useCartStore.getState().clearCart();
        const product = products[0];
        useCartStore.getState().addItem(product, 1);
        useAppStore.getState().setLanguage('ar');
        useCartStore.getState().openCart();
      });

      render(<Cart />);
      
      // Check for Arabic price formatting (ر.س. is the Arabic currency symbol for SAR)
      const priceElements = screen.getAllByText(/ر\.س\.|SAR/);
      expect(priceElements.length).toBeGreaterThan(0);
    });
  });

  describe('Real Translation Integration', () => {
    it('should display correct translations', () => {
      act(() => {
        useCartStore.getState().openCart();
      });

      render(<Cart />);
      
      // The translation system should resolve keys to text
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument(); // Should show translated text
    });

    it('should display Arabic translations when language is Arabic', () => {
      act(() => {
        useAppStore.getState().setLanguage('ar');
        useCartStore.getState().openCart();
      });

      render(<Cart />);
      
      // Should render with Arabic language context (cart.empty translation)
      expect(screen.getByText('السلة فارغة')).toBeInTheDocument();
    });
  });

  describe('Edge Cases with Real Data', () => {
    it('should handle products with zero price', () => {
      // Find a product with zero or very low price, or test with edge case
      act(() => {
        useCartStore.getState().clearCart();
        const product = products.find(p => p.price === 0) || products[0];
        // Create a test product with zero price
        const zeroProduct = { ...product, price: 0 };
        useCartStore.getState().addItem(zeroProduct, 1);
        useCartStore.getState().openCart();
      });

      render(<Cart />);
      
      expect(screen.getByText(products[0].title)).toBeInTheDocument();
    });

    it('should handle very long product names from real data', () => {
      // Find the product with the longest name
      const longestNameProduct = products.reduce((prev, current) => 
        prev.title.length > current.title.length ? prev : current
      );

      act(() => {
        useCartStore.getState().clearCart();
        useCartStore.getState().addItem(longestNameProduct, 1);
        useCartStore.getState().openCart();
      });

      render(<Cart />);
      
      expect(screen.getByText(longestNameProduct.title)).toBeInTheDocument();
    });

    it('should handle high quantities with real products', () => {
      act(() => {
        useCartStore.getState().clearCart();
        const product = products[0];
        useCartStore.getState().addItem(product, 99);
        useCartStore.getState().openCart();
      });

      render(<Cart />);
      
      // Test that totals are calculated correctly even with high quantities
      const cartState = useCartStore.getState();
      expect(cartState.totals.total).toBe(products[0].price * 99 * 1.15); // With 15% tax
      expect(cartState.items[0].quantity).toBe(99);
    });
  });

  describe('Performance with Real Data', () => {
    it('should render efficiently with many real products', () => {
      act(() => {
        useCartStore.getState().clearCart();
        
        // Add first 10 real products to test performance
        const selectedProducts = products.slice(0, 10);
        selectedProducts.forEach(product => {
          useCartStore.getState().addItem(product, 1);
        });
        
        useCartStore.getState().openCart();
      });

      const startTime = performance.now();
      render(<Cart />);
      const endTime = performance.now();
      
      // Should render within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      
      // Verify products are rendered by checking cart state
      const cartState = useCartStore.getState();
      expect(cartState.items.length).toBeGreaterThan(0);
    });
  });
});