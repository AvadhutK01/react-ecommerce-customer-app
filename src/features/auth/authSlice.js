import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFriendlyErrorMessage } from '../../utils/errorMessages';
import * as authService from './authService';


export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const { user, token } = await authService.registerUser(userData.email, userData.password, userData.name);
      return { user, token };
    } catch (error) {
      return rejectWithValue(getFriendlyErrorMessage(error.message || error));
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, { rejectWithValue }) => {
    try {
      const { user, token } = await authService.loginUser(userData.email, userData.password);
      return { user, token };
    } catch (error) {
      return rejectWithValue(getFriendlyErrorMessage(error.message || error));
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ name }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const updatedUser = await authService.updateProfile(token, name, getState().auth.user);
      return { user: updatedUser };
    } catch (error) {
      return rejectWithValue(getFriendlyErrorMessage(error.message || error));
    }
  }
);

export const sendVerificationEmail = createAsyncThunk(
  'auth/sendVerificationEmail',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await authService.sendVerificationEmail(token);
      return true;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send verification email');
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) return null;
      const user = await authService.checkAuthStatus(token);
      return user;
    } catch (error) {
      return rejectWithValue(error.message || 'Session expired');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      await authService.forgotPassword(email);
      return true;
    } catch (error) {
      return rejectWithValue(getFriendlyErrorMessage(error.message || error));
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('customer_user')) || null,
  token: localStorage.getItem('customer_token') || null,
  isAuthenticated: !!localStorage.getItem('customer_token'),
  isVerified: JSON.parse(localStorage.getItem('customer_user'))?.isVerified || false,
  isLoading: false,
  isUpdating: false,
  isSendingVerification: false,
  isForgotPasswordLoading: false,
  forgotPasswordSent: false,
  verificationSent: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('customer_user');
      localStorage.removeItem('customer_token');
    },
    clearError: (state) => {
      state.error = null;
    },
    resetForgotStatus: (state) => {
      state.forgotPasswordSent = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isVerified = action.payload.user.isVerified || false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isVerified = action.payload.user.isVerified || false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => { state.isUpdating = true; state.error = null; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.user = action.payload.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      .addCase(sendVerificationEmail.pending, (state) => { state.isSendingVerification = true; })
      .addCase(sendVerificationEmail.fulfilled, (state) => {
        state.isSendingVerification = false;
        state.verificationSent = true;
      })
      .addCase(sendVerificationEmail.rejected, (state) => {
        state.isSendingVerification = false;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isVerified = action.payload.isVerified;
        }
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('customer_user');
        localStorage.removeItem('customer_token');
      })
      .addCase(forgotPassword.pending, (state) => {
        state.isForgotPasswordLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isForgotPasswordLoading = false;
        state.forgotPasswordSent = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isForgotPasswordLoading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearError, resetForgotStatus } = authSlice.actions;
export default authSlice.reducer;
