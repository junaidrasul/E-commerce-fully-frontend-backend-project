import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: JSON.parse(localStorage.getItem('cart') || '[]'),

  addItem: (product, quantity = 1, variant = null) => {
    const items = get().items;
    const existingIdx = items.findIndex(i => i.product._id === product._id);

    let newItems;
    if (existingIdx >= 0) {
      newItems = items.map((item, idx) =>
        idx === existingIdx ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      newItems = [...items, {
        product,
        quantity,
        variant,
        price: product.discountPrice > 0 ? product.discountPrice : product.price
      }];
    }

    localStorage.setItem('cart', JSON.stringify(newItems));
    set({ items: newItems });
  },

  removeItem: (productId) => {
    const newItems = get().items.filter(i => i.product._id !== productId);
    localStorage.setItem('cart', JSON.stringify(newItems));
    set({ items: newItems });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) { get().removeItem(productId); return; }
    const newItems = get().items.map(i => i.product._id === productId ? { ...i, quantity } : i);
    localStorage.setItem('cart', JSON.stringify(newItems));
    set({ items: newItems });
  },

  clearCart: () => {
    localStorage.removeItem('cart');
    set({ items: [] });
  },

  get subtotal() { return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0); },
  get itemCount() { return get().items.reduce((sum, i) => sum + i.quantity, 0); },

  getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));

export default useCartStore;
