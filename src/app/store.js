import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import productReducer from '../features/products/productSlice';
import addressReducer from '../features/addresses/addressSlice';
import cartReducer from '../features/cart/cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    addresses: addressReducer,
    cart: cartReducer,
  },
});
