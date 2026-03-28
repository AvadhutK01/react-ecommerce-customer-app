import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getFriendlyErrorMessage } from '../../utils/errorMessages';

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const AUTH_BASE_URL = 'https://identitytoolkit.googleapis.com/v1/accounts';

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${AUTH_BASE_URL}:signUp?key=${API_KEY}`, {
         email: userData.email,
         password: userData.password,
         returnSecureToken: true
      });
      
      const user = {
        email: response.data.email,
        uid: response.data.localId,
        name: userData.name || response.data.email.split('@')[0]
      };

      localStorage.setItem('customer_user', JSON.stringify(user));
      localStorage.setItem('customer_token', response.data.idToken);
      
      return { user, token: response.data.idToken };
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Registration failed';
      return rejectWithValue(getFriendlyErrorMessage(message));
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${AUTH_BASE_URL}:signInWithPassword?key=${API_KEY}`, {
        email: userData.email,
        password: userData.password,
        returnSecureToken: true
      });

      const user = {
        email: response.data.email,
        uid: response.data.localId,
        name: response.data.displayName || response.data.email.split('@')[0]
      };

      localStorage.setItem('customer_user', JSON.stringify(user));
      localStorage.setItem('customer_token', response.data.idToken);

      return { user, token: response.data.idToken };
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Login failed';
      return rejectWithValue(getFriendlyErrorMessage(message));
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ name }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(`${AUTH_BASE_URL}:update?key=${API_KEY}`, {
        idToken: token,
        displayName: name,
        returnSecureToken: true
      });

      const updatedUser = {
        ...getState().auth.user,
        name: response.data.displayName
      };
      localStorage.setItem('customer_user', JSON.stringify(updatedUser));
      
      return { user: updatedUser };
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Update failed';
      return rejectWithValue(getFriendlyErrorMessage(message));
    }
  }
);

export const sendVerificationEmail = createAsyncThunk(
  'auth/sendVerificationEmail',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`, {
        idToken: token,
        requestType: 'VERIFY_EMAIL'
      });
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to send verification email');
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) return null;
      
      const response = await axios.post(`${AUTH_BASE_URL}:lookup?key=${API_KEY}`, {
        idToken: token
      });
      
      const userData = response.data.users[0];
      const user = {
        email: userData.email,
        uid: userData.localId,
        name: userData.displayName || userData.email.split('@')[0],
        isVerified: userData.emailVerified
      };
      
      localStorage.setItem('customer_user', JSON.stringify(user));
      return user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Session expired');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`, {
        email,
        requestType: 'PASSWORD_RESET'
      });
      return true;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to send reset email';
      return rejectWithValue(getFriendlyErrorMessage(message));
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
