import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { removeItem, updateQuantity } from '../features/cart/cartSlice';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ChevronLeft, CreditCard } from 'lucide-react';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalAmount } = useSelector((state) => state.cart);
  const { isVerified } = useSelector((state) => state.auth);

  const handleCheckout = () => {
    if (!isVerified) {
      navigate('/profile');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center p-8 bg-gray-50 rounded-full mb-8 text-gray-200">
          <ShoppingBag size={64} />
        </div>
        <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-4">Your cart is empty</h2>
        <p className="text-gray-500 font-bold mb-10 max-w-sm mx-auto uppercase text-xs tracking-widest">Discover our premium collections and find something extraordinary today.</p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-3 px-10 py-5 bg-gray-950 text-white rounded-[2.5rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-primary-600 transition-all shadow-xl shadow-gray-200 active:scale-[0.98]"
        >
          Start Shopping
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
      <div className="mb-16 space-y-4">
        <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">Your Selection</p>
        <h1 className="text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">Shopping Cart</h1>
        <div className="h-2 w-40 bg-primary-600 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-8">
          {items.map((item) => (
            <div key={item.id} className="group relative bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 hover:shadow-gray-200/40 transition-all duration-500 flex flex-col sm:flex-row items-center gap-10">
              <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden bg-gray-50 border border-gray-50 flex-shrink-0">
                <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-tight">{item.name}</h3>
                <p className="text-3xl font-black text-primary-600 tracking-tighter">₹{item.price.toLocaleString()}</p>
                
                <div className="flex items-center justify-center sm:justify-start gap-6">
                  <div className="flex items-center bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                    <button 
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                      className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-400 hover:text-primary-600"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center text-sm font-black text-gray-900">{item.quantity}</span>
                    <button 
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                      className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-400 hover:text-primary-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => dispatch(removeItem(item.id))}
                    className="p-4 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest hover:text-primary-600 transition-colors ml-4">
            <ChevronLeft size={16} />
            Continue Shopping
          </Link>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 sticky top-24">
            <h2 className="text-xl font-black uppercase tracking-widest text-gray-900 mb-10 border-b border-gray-50 pb-6">Order Summary</h2>
            
            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-gray-400">
                <span>Subtotal</span>
                <span className="text-gray-900">₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-gray-400">
                <span>Shipping</span>
                <span className="text-green-500 font-bold italic">Calculated at Checkout</span>
              </div>
              <div className="h-px bg-gray-50 w-full" />
              <div className="flex justify-between items-end pb-2">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Total</span>
                <span className="text-4xl font-black tracking-tighter text-primary-600">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-3 py-6 bg-gray-950 text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-primary-600 transition-all shadow-xl shadow-gray-200 active:scale-[0.98]"
            >
              <CreditCard size={20} />
              Secure Checkout
            </button>
            <p className="mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center opacity-60">Tax inclusive prices</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
