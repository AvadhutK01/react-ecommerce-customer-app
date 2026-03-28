import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as productService from '../../api/productService';

export const fetchHomeData = createAsyncThunk(
  'products/fetchHomeData',
  async (_, { rejectWithValue }) => {
    try {
      const { items: categories } = await productService.getCategories();
      const categoryData = await Promise.all(
        categories.slice(0, 4).map(async (cat) => {
          const products = await productService.getProductsByCategory(cat.id, 6);
          return { ...cat, products };
        })
      );
      return categoryData.filter(cat => cat.products && cat.products.length > 0);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCategoryProducts = createAsyncThunk(
  'products/fetchCategoryProducts',
  async ({ categoryId, page = 0 }, { rejectWithValue }) => {
    try {
      const limit = 10;
      const offset = page * limit;
      const products = await productService.getProductsByCategory(categoryId, limit, offset);
      return { products, page, hasMore: products.length === limit };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCategoryDetails = createAsyncThunk(
  'products/fetchCategoryDetails',
  async (categoryId, { rejectWithValue }) => {
    try {
      return await productService.getCategoryById(categoryId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    homeCategories: [],
    categoryProducts: [],
    currentCategory: null,
    currentPage: 0,
    hasMore: true,
    searchTerm: '',
    isLoading: false,
    isPaginating: false,
    error: null,
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    resetCategoryProgress: (state) => {
      state.categoryProducts = [];
      state.currentCategory = null;
      state.currentPage = 0;
      state.hasMore = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeData.pending, (state) => { state.isLoading = true; })
      .addCase(fetchHomeData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.homeCategories = action.payload;
      })
      .addCase(fetchHomeData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCategoryDetails.fulfilled, (state, action) => {
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryProducts.pending, (state, action) => {
        if (action.meta.arg.page === 0) state.isLoading = true;
        else state.isPaginating = true;
      })
      .addCase(fetchCategoryProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isPaginating = false;
        if (action.payload.page === 0) {
          state.categoryProducts = action.payload.products;
        } else {
          state.categoryProducts = [...state.categoryProducts, ...action.payload.products];
        }
        state.currentPage = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchCategoryProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isPaginating = false;
        state.error = action.payload;
      });
  }
});

export const { setSearchTerm, resetCategoryProgress } = productSlice.actions;
export default productSlice.reducer;
