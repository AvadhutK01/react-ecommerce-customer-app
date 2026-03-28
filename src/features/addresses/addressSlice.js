import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as addressService from '../../api/addressService';

export const fetchAddresses = createAsyncThunk(
  'addresses/fetchAddresses',
  async (userId, { rejectWithValue }) => {
    try {
      return await addressService.getAddresses(userId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveAddress = createAsyncThunk(
  'addresses/saveAddress',
  async ({ id, ...data }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      const addressData = { ...data, userId: user.uid };
      if (id) {
        return await addressService.updateAddress(id, addressData);
      } else {
        return await addressService.addAddress(addressData);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const addressSlice = createSlice({
  name: 'addresses',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(saveAddress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(saveAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(saveAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export default addressSlice.reducer;
