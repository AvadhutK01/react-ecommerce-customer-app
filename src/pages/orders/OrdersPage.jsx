import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../features/orders/orderSlice';
import { Package, Calendar, CreditCard, ChevronRight, ShoppingBag, Clock, CheckCircle, Truck, PackageCheck, XCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getOrderStatusStyles, ORDER_STATUS } from '../../utils/statusStyles';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: orders, isLoading } = useSelector((state) => state.orders);

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchOrders(user.uid));
    }
  }, [dispatch, user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case ORDER_STATUS.DELIVERED: return <PackageCheck size={14} />;
      case ORDER_STATUS.SHIPPED: return <Truck size={14} />;
      case ORDER_STATUS.PROCESSING: return <RefreshCw size={14} className="animate-spin" />;
      case ORDER_STATUS.CANCELLED:
      case ORDER_STATUS.REJECTED: return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-primary-600/20 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Retrieving transactions...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center text-left">
        <div className="p-8 bg-gray-50 rounded-full inline-flex mb-8 text-gray-200">
          <ShoppingBag size={64} />
        </div>
        <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-4">No Orders Yet</h2>
        <p className="text-gray-500 font-bold mb-10 max-w-sm mx-auto uppercase text-xs tracking-widest">No orders placed yet...</p>
        <Link to="/" className="inline-flex px-10 py-5 bg-gray-950 text-white rounded-full text-sm font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-gray-200">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
      <div className="mb-16 space-y-4">
        <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">Purchase History</p>
        <h1 className="text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">Your Orders</h1>
        <div className="h-2 w-40 bg-primary-600 rounded-full" />
      </div>

      <div className="space-y-8">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden hover:shadow-gray-200/40 transition-all duration-500">
            <div className="p-10 flex flex-col lg:flex-row gap-10">
              <div className="lg:w-1/3 space-y-6">
                <div className="flex items-center gap-2">
                  <span className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getOrderStatusStyles(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-400">
                    <Package size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Order ID: #{order.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <Calendar size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-primary-600">
                    <CreditCard size={14} />
                    <span className="text-sm font-black tracking-tight">₹{Number(order.totalAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 lg:pl-10 lg:border-l border-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                        <img src={item.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase text-gray-900 truncate leading-tight mb-1">{item.name}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-end justify-end">
                <Link to={`/order/${order.id}`} className="p-4 bg-gray-50 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all">
                  <ChevronRight size={20} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
