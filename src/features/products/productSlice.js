import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as productService from '../../api/productService';

export const fetchHomeData = createAsyncThunk(
  'products/fetchHomeData',
  async (_, { rejectWithValue }) => {
    try {
      const { items: categories } = await productService.getCategories();
      const categoryData = await Promise.all(
        categories.slice(0, 4).map(async (cat) => {
          const products = await productService.getProductsByCategory(cat.id);
          return { ...cat, products };
        })
      );
      return categoryData.filter(cat => cat.products && cat.products.length > 0);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    homeCategories: [],
    searchTerm: '',
    isLoading: false,
    error: null,
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
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
      });
  }
});

export const { setSearchTerm } = productSlice.actions;
export default productSlice.reducer;
