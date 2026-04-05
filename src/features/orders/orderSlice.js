import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as orderService from './orderService';
import * as productService from '../products/productService';

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (userId, { rejectWithValue }) => {
    try {
      return await orderService.getUserOrders(userId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrderDetail = createAsyncThunk(
  'orders/fetchOrderDetail',
  async (orderId, { rejectWithValue }) => {
    try {
      return await orderService.getOrderById(orderId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderThunk = createAsyncThunk(
  'orders/updateOrder',
  async ({ orderId, data }, { rejectWithValue }) => {
    try {
      return await orderService.updateOrder(orderId, data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const placeOrderThunk = createAsyncThunk(
  'orders/placeOrder',
  async ({ orderData, cartItems }, { rejectWithValue }) => {
    try {
      const order = await orderService.createOrder(orderData);
      for (const item of cartItems) {
        await productService.updateProductStock(item.id, -item.quantity);
      }
      return order;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelOrderThunk = createAsyncThunk(
  'orders/cancelOrder',
  async ({ orderId, updateData, items }, { rejectWithValue }) => {
    try {
      const updated = await orderService.updateOrder(orderId, updateData);
      for (const item of items) {
        await productService.updateProductStock(item.id, item.quantity);
      }
      return updated;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    currentOrder: null,
    isLoading: false,
    isDetailLoading: false,
    isPlacing: false,
    isCancelling: false,
    error: null,
  },
  reducers: {
    clearOrders: (state) => {
      state.items = [];
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderDetail.pending, (state) => {
        state.isDetailLoading = true;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.isDetailLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.isDetailLoading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderThunk.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(placeOrderThunk.pending, (state) => {
        state.isPlacing = true;
        state.error = null;
      })
      .addCase(placeOrderThunk.fulfilled, (state) => {
        state.isPlacing = false;
      })
      .addCase(placeOrderThunk.rejected, (state, action) => {
        state.isPlacing = false;
        state.error = action.payload;
      })
      .addCase(cancelOrderThunk.pending, (state) => {
        state.isCancelling = true;
        state.error = null;
      })
      .addCase(cancelOrderThunk.fulfilled, (state, action) => {
        state.isCancelling = false;
        state.currentOrder = action.payload;
      })
      .addCase(cancelOrderThunk.rejected, (state, action) => {
        state.isCancelling = false;
        state.error = action.payload;
      });
  }
});

export const { clearOrders, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
