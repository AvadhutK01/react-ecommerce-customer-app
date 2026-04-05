import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as reviewService from './reviewService';

export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async (productId, { rejectWithValue }) => {
    try {
      return await reviewService.getReviewsByProduct(productId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserProductReview = createAsyncThunk(
  'reviews/fetchUserProductReview',
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      return await reviewService.getUserProductReview(userId, productId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitReview = createAsyncThunk(
  'reviews/submitReview',
  async ({ reviewId, payload }, { rejectWithValue }) => {
    try {
      if (reviewId) {
        return await reviewService.updateReview(reviewId, payload);
      }
      return await reviewService.addReview(payload);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    items: [],
    userReview: null,
    isLoading: false,
    isSubmitting: false,
    isFetchingUserReview: false,
    error: null,
  },
  reducers: {
    clearUserReview: (state) => {
      state.userReview = null;
    },
    clearReviews: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserProductReview.pending, (state) => {
        state.isFetchingUserReview = true;
        state.userReview = null;
      })
      .addCase(fetchUserProductReview.fulfilled, (state, action) => {
        state.isFetchingUserReview = false;
        state.userReview = action.payload;
      })
      .addCase(fetchUserProductReview.rejected, (state) => {
        state.isFetchingUserReview = false;
      })
      .addCase(submitReview.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.items.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.unshift(action.payload);
        }
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserReview, clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
