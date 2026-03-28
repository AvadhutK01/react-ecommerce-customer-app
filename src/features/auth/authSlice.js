import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../../api/authService';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await authService.loginUser(email, password);
      localStorage.setItem('customer_token', data.idToken);
      localStorage.setItem('customer_user', JSON.stringify(data));
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      const data = await authService.registerUser(email, password, name);
      localStorage.setItem('customer_token', data.idToken);
      localStorage.setItem('customer_user', JSON.stringify(data));
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('customer_user')) || null,
    token: localStorage.getItem('customer_token') || null,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_user');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.isLoading = true; })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.token = action.payload.idToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.token = action.payload.idToken;
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
