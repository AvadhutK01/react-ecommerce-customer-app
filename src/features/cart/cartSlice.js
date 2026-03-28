import { createSlice } from '@reduxjs/toolkit';

const items = JSON.parse(localStorage.getItem('customer_cart')) || [];
const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

const initialState = {
  items,
  totalAmount,
  totalQuantity,
};

const calculateTotals = (state) => {
  state.totalQuantity = state.items.reduce((acc, item) => acc + item.quantity, 0);
  state.totalAmount = state.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  localStorage.setItem('customer_cart', JSON.stringify(state.items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);
      
      if (!existingItem) {
        state.items.push({
          ...newItem,
          quantity: 1,
          totalPrice: newItem.price
        });
      } else {
        existingItem.quantity++;
        existingItem.totalPrice += newItem.price;
      }
      calculateTotals(state);
    },
    removeItem: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter(item => item.id !== id);
      calculateTotals(state);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find(item => item.id === id);
      if (existingItem && quantity > 0) {
        existingItem.quantity = quantity;
        existingItem.totalPrice = existingItem.price * quantity;
      }
      calculateTotals(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.totalQuantity = 0;
      localStorage.removeItem('customer_cart');
    },
    initializeCart: (state) => {
      calculateTotals(state);
    }
  }
});

export const { addItem, removeItem, updateQuantity, clearCart, initializeCart } = cartSlice.actions;
export default cartSlice.reducer;
