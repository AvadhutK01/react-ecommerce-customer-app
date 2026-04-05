import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cartService from './cartService';

const calculateTotals = (state) => {
  state.totalQuantity = state.items.reduce((acc, item) => acc + item.quantity, 0);
  state.totalAmount = state.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
};

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (userId, { rejectWithValue }) => {
    try {
      const cart = await cartService.getCart(userId);
      return cart.items || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addItem = createAsyncThunk(
  'cart/addItem',
  async (product, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      const { items } = getState().cart;
      if (!user) throw new Error('User not authenticated');

      let newItems = [...items];
      const existingItemIndex = newItems.findIndex(item => item.id === product.id);

      if (existingItemIndex === -1) {
        newItems.push({
          ...product,
          quantity: Math.min(product.quantity || 1, Number(product.stock)),
          totalPrice: product.price * Math.min(product.quantity || 1, Number(product.stock))
        });
      } else {
        const existingItem = newItems[existingItemIndex];
        const addedQuantity = Math.min(product.quantity || 1, Number(product.stock) - existingItem.quantity);
        if (addedQuantity > 0) {
          newItems[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + addedQuantity,
            totalPrice: (existingItem.quantity + addedQuantity) * existingItem.price
          };
        }
      }

      await cartService.updateCart(user.uid, newItems);
      return newItems;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeItem = createAsyncThunk(
  'cart/removeItem',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      const { items } = getState().cart;
      if (!user) throw new Error('User not authenticated');

      const newItems = items.filter(item => item.id !== productId);
      await cartService.updateCart(user.uid, newItems);
      return newItems;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ id, quantity }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      const { items } = getState().cart;
      if (!user) throw new Error('User not authenticated');

      const newItems = items.map(item => {
        if (item.id === id) {
          const newQuantity = Math.min(Math.max(1, quantity), Number(item.stock));
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: item.price * newQuantity
          };
        }
        return item;
      });

      await cartService.updateCart(user.uid, newItems);
      return newItems;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      if (!user) throw new Error('User not authenticated');

      await cartService.updateCart(user.uid, []);
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  totalAmount: 0,
  totalQuantity: 0,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        calculateTotals(state);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.items = action.payload;
        calculateTotals(state);
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        state.items = action.payload;
        calculateTotals(state);
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.items = action.payload;
        calculateTotals(state);
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.totalAmount = 0;
        state.totalQuantity = 0;
      });
  }
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
