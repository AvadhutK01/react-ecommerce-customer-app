import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAddresses } from '../features/addresses/addressSlice';
import { clearCart } from '../features/cart/cartSlice';
import * as orderService from '../api/orderService';
import * as productService from '../api/productService';
import { MapPin, CreditCard, Banknote, CheckCircle, Loader2, ChevronRight, AlertCircle, ShoppingBag } from 'lucide-react';
import { ORDER_STATUS, PAYMENT_STATUS } from '../utils/statusStyles';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items: addresses, isLoading: isAddressesLoading } = useSelector((state) => state.addresses);
  const { items: cartItems, totalAmount } = useSelector((state) => state.cart);

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('ONLINE'); // ONLINE or COD
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchAddresses(user.uid));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(addresses[0]);
    }
  }, [addresses, selectedAddress]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return;

    setIsPlacingOrder(true);

    if (paymentMethod === 'ONLINE') {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Razorpay SDK failed to load. Are you online?');
        setIsPlacingOrder(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'Ecommerce Store',
        description: 'Luxury Purchase Transaction',
        handler: async (response) => {
          const orderData = {
            userId: user.uid,
            customerName: user.name,
            customerEmail: user.email,
            items: cartItems,
            totalAmount,
            shippingAddress: selectedAddress,
            paymentMethod: 'ONLINE',
            paymentId: response.razorpay_payment_id,
            status: ORDER_STATUS.PENDING,
            paymentStatus: PAYMENT_STATUS.PAID,
            createdAt: new Date().toISOString(),
          };

          await orderService.createOrder(orderData);
          
          for (const item of cartItems) {
            await productService.updateProductStock(item.id, -item.quantity);
          }

          setOrderSuccess(true);
          dispatch(clearCart());
          setTimeout(() => navigate('/'), 5000);
        },
        modal: {
          ondismiss: async () => {
            const orderData = {
              userId: user.uid,
              customerName: user.name,
              customerEmail: user.email,
              items: cartItems,
              totalAmount,
              shippingAddress: selectedAddress,
              paymentMethod: 'ONLINE',
              status: ORDER_STATUS.REJECTED,
              paymentStatus: PAYMENT_STATUS.FAILED,
              createdAt: new Date().toISOString(),
            };
            await orderService.createOrder(orderData);
            alert('Payment cancelled. Order recorded as failed.');
            setIsPlacingOrder(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: selectedAddress.phone
        },
        theme: {
          color: '#1d4ed8'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (response) => {
        const orderData = {
          userId: user.uid,
          customerName: user.name,
          customerEmail: user.email,
          items: cartItems,
          totalAmount,
          shippingAddress: selectedAddress,
          paymentMethod: 'ONLINE',
          status: ORDER_STATUS.REJECTED,
          paymentStatus: PAYMENT_STATUS.FAILED,
          paymentErrorCode: response.error.code,
          createdAt: new Date().toISOString(),
        };
        await orderService.createOrder(orderData);
        alert('Payment failed: ' + response.error.description);
        setIsPlacingOrder(false);
      });
      rzp.open();
    } else {
      try {
        const orderData = {
          userId: user.uid,
          customerName: user.name,
          customerEmail: user.email,
          items: cartItems,
          totalAmount,
          shippingAddress: selectedAddress,
          paymentMethod: 'COD',
          status: ORDER_STATUS.PENDING,
          paymentStatus: PAYMENT_STATUS.PENDING,
          createdAt: new Date().toISOString(),
        };

        await orderService.createOrder(orderData);
        
        for (const item of cartItems) {
          await productService.updateProductStock(item.id, -item.quantity);
        }

        setOrderSuccess(true);
        dispatch(clearCart());
        setTimeout(() => navigate('/'), 5000);
      } catch (error) {
        console.error('Order failed:', error);
      } finally {
        setIsPlacingOrder(false);
      }
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <CheckCircle size={48} />
        </div>
        <h1 className="text-5xl font-black text-gray-900 uppercase tracking-tighter mb-4">Order Confirmed!</h1>
        <p className="text-gray-500 font-bold mb-10 uppercase text-xs tracking-widest leading-loose">
          Thank you for choosing Us. Your order has been placed successfully and is being prepared for shipment.
          <br />Redirecting to home in 5 seconds...
        </p>
        <button onClick={() => navigate('/')} className="px-10 py-5 bg-gray-950 text-white rounded-full text-sm font-black uppercase tracking-widest shadow-xl">
          Back to Home
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="p-8 bg-gray-50 rounded-full inline-flex mb-8 text-gray-200">
          <ShoppingBag size={64} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Cart is empty</h2>
        <button onClick={() => navigate('/')} className="mt-8 px-10 py-4 bg-primary-600 text-white rounded-full font-black uppercase text-xs tracking-widest">Shop Now</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
      <div className="mb-16 space-y-4">
        <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">Final Checkout</p>
        <h1 className="text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">Complete Order</h1>
        <div className="h-2 w-40 bg-primary-600 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          {/* Section 1: Shipping Address */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-widest text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-xs">01</div>
                Shipping Destination
              </h2>
              <button onClick={() => navigate('/addresses')} className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:opacity-70">Manage Addresses</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr)}
                  className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-300 relative group ${selectedAddress?.id === addr.id ? 'border-primary-600 bg-primary-50/30 shadow-lg' : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'}`}
                >
                  {selectedAddress?.id === addr.id && (
                    <div className="absolute top-4 right-6 text-primary-600 animate-in zoom-in duration-300">
                      <CheckCircle size={20} />
                    </div>
                  )}
                  <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-2">{addr.name}</h4>
                  <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed line-clamp-2">{addr.street}, {addr.city}</p>
                </div>
              ))}
              {addresses.length === 0 && !isAddressesLoading && (
                <button onClick={() => navigate('/addresses')} className="p-6 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2 hover:bg-gray-50 transition-all">
                  <MapPin size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Add New Address</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="space-y-6">
            <h2 className="text-xl font-black uppercase tracking-widest text-gray-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-xs">02</div>
              Payment Method
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setPaymentMethod('ONLINE')}
                className={`p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-300 flex items-center gap-6 ${paymentMethod === 'ONLINE' ? 'border-primary-600 bg-primary-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'ONLINE' ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                  <CreditCard size={24} />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest">Online Payment</h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Pay via Razorpay</p>
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-300 flex items-center gap-6 ${paymentMethod === 'COD' ? 'border-primary-600 bg-primary-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'COD' ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                  <Banknote size={24} />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest">Cash on Delivery</h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Pay upon arrival</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 sticky top-24">
            <h3 className="text-lg font-black uppercase tracking-widest text-gray-900 mb-8 border-b border-gray-50 pb-6">Order Summary</h3>

            <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  <img src={item.thumbnail} className="w-12 h-12 rounded-xl object-cover bg-gray-50" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase text-gray-900 truncate">{item.name}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-[10px] font-black text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-10 pt-6 border-t border-gray-50">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-green-500 uppercase tracking-widest">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="text-xs font-black uppercase tracking-widest text-gray-900">Final Total</span>
                <span className="text-3xl font-black tracking-tighter text-primary-600">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button
              disabled={!selectedAddress || isPlacingOrder}
              onClick={handlePlaceOrder}
              className="w-full py-6 bg-gray-950 text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-primary-600 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isPlacingOrder ? <Loader2 className="animate-spin h-5 w-5" /> : <ChevronRight size={18} />}
              {paymentMethod === 'ONLINE' ? 'Pay Now' : 'Place Order'}
            </button>

            {!selectedAddress && (
              <p className="flex items-center gap-1.5 justify-center mt-6 text-orange-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                <AlertCircle size={12} />
                Please select a destination
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
