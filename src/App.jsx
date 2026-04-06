import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import Header from './components/layout/Header';
import { checkAuthStatus } from './features/auth/authSlice';
import { fetchCart } from './features/cart/cartSlice';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    if (token) {
      dispatch(checkAuthStatus());
    }
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      dispatch(fetchCart(user.uid));
    }
  }, [isAuthenticated, user, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="pt-2">
          <AppRoutes />
        </div>
      </main>
    </div>
  );
}

export default App;
