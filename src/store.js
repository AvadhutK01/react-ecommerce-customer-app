import { configureStore } from '@reduxjs/toolkit';
import productReducer from './features/products/productSlice';
import authReducer from './features/auth/authSlice';
import addressReducer from './features/addresses/addressSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    auth: authReducer,
    addresses: addressReducer,
  },
});
