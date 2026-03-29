import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetail, clearCurrentOrder, updateOrderThunk } from '../features/orders/orderSlice';
import { ChevronLeft, Box, Calendar, CreditCard, MapPin, Truck, CheckCircle, Clock, PackageCheck, ShieldCheck, XCircle, Star, MessageSquare, AlertCircle } from 'lucide-react';
import { ORDER_STATUS, PAYMENT_STATUS, getOrderStatusStyles, getPaymentStatusStyles } from '../utils/statusStyles';
import * as reviewService from '../api/reviewService';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentOrder, isDetailLoading } = useSelector((state) => state.orders);

  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState({ type: null, message: '' });
  const [existingReviewId, setExistingReviewId] = useState(null);
  const [isReviewLoading, setReviewLoading] = useState(false);
  const [reviewedProductIds, setReviewedProductIds] = useState(new Set());

  useEffect(() => {
    dispatch(fetchOrderDetail(orderId));
    return () => dispatch(clearCurrentOrder());
  }, [dispatch, orderId]);

  useEffect(() => {
    if (currentOrder?.status === ORDER_STATUS.DELIVERED && user?.uid) {
      const fetchReviewStatuses = async () => {
        const statuses = await Promise.all(
          currentOrder.items.map(async (item) => {
            const existing = await reviewService.getUserProductReview(user.uid, item.id);
            return { id: item.id, hasReview: !!existing };
          })
        );
        setReviewedProductIds(new Set(statuses.filter(s => s.hasReview).map(s => s.id)));
      };
      fetchReviewStatuses();
    }
  }, [currentOrder, user?.uid]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    const updateData = {
      status: ORDER_STATUS.CANCELLED,
      ...(currentOrder.paymentMethod === 'ONLINE' && { paymentStatus: PAYMENT_STATUS.REFUNDED })
    };

    dispatch(updateOrderThunk({ orderId, data: updateData }));
  };

  const handleMarkPaid = () => {
    dispatch(updateOrderThunk({
      orderId,
      data: { paymentStatus: PAYMENT_STATUS.PAID }
    }));
  };

  const handleOpenReviewModal = async (product) => {
    setSelectedProductForReview(product);
    setReviewFeedback({ type: null, message: '' });
    setRating(5);
    setComment('');
    setExistingReviewId(null);
    setReviewModalOpen(true);
    setReviewLoading(true);

    try {
      const existing = await reviewService.getUserProductReview(user.uid, product.id);
      if (existing) {
        setExistingReviewId(existing.id);
        setRating(existing.rating);
        setComment(existing.comment);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const reviewPayload = {
        productId: selectedProductForReview.id,
        userId: user.uid,
        userName: user.name,
        rating,
        comment,
        ...(existingReviewId ? { updatedAt: new Date().toISOString() } : { createdAt: new Date().toISOString() })
      };

      if (existingReviewId) {
        await reviewService.updateReview(existingReviewId, reviewPayload);
        setReviewFeedback({ type: 'success', message: 'Review updated successfully!' });
      } else {
        await reviewService.addReview(reviewPayload);
        setReviewFeedback({ type: 'success', message: 'Review submitted successfully!' });
      }
      
      setReviewedProductIds(prev => new Set([...prev, selectedProductForReview.id]));

      setTimeout(() => {
        setReviewModalOpen(false);
        setReviewFeedback({ type: null, message: '' });
        setRating(5);
        setComment('');
        setExistingReviewId(null);
      }, 2000);
    } catch (error) {
      setReviewFeedback({ type: 'error', message: 'Failed to submit review' });
      setTimeout(() => setReviewFeedback({ type: null, message: '' }), 4000);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (isDetailLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-primary-600/20 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (!currentOrder) return null;

  const canCancel = [ORDER_STATUS.PENDING, ORDER_STATUS.PROCESSING].includes(currentOrder.status);
  const canReview = currentOrder.status === ORDER_STATUS.DELIVERED;
  const showMarkPaid = currentOrder.status === ORDER_STATUS.DELIVERED &&
    currentOrder.paymentMethod === 'COD' &&
    currentOrder.paymentStatus !== PAYMENT_STATUS.PAID;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
      <Link to="/orders" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-primary-600 transition-colors mb-12 group">
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to History
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${getOrderStatusStyles(currentOrder.status)}`}>
                  {currentOrder.status}
                </span>
                {currentOrder.paymentStatus && (
                  <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${getPaymentStatusStyles(currentOrder.paymentStatus)}`}>
                    Payment: {currentOrder.paymentStatus}
                  </span>
                )}
              </div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">Order #{currentOrder.id.slice(-8).toUpperCase()}</h1>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Placed on {new Date(currentOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            {canCancel && (
              <button
                onClick={handleCancelOrder}
                className="flex items-center gap-2 px-8 py-4 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-100"
              >
                <XCircle size={16} />
                Cancel Order
              </button>
            )}
          </div>

          <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 space-y-10">
            <h2 className="text-xl font-black uppercase tracking-widest text-gray-900 flex items-center gap-4">
              <Box className="text-primary-600" size={24} />
              Items in Shipment
            </h2>
            <div className="space-y-8">
              {currentOrder.items?.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-center gap-8 group pb-8 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gray-50 flex-shrink-0">
                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <h4 className="text-sm font-black uppercase tracking-tight text-gray-900">{item.name}</h4>
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Quantity: {item.quantity}</p>
                    {canReview && (
                      <button
                        onClick={() => handleOpenReviewModal(item)}
                        className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary-600 hover:underline flex items-center gap-2"
                      >
                        <Star size={12} />
                        {reviewedProductIds.has(item.id) ? 'Update a Review' : 'Write a Review'}
                      </button>
                    )}
                  </div>
                  <p className="text-lg font-black text-gray-900 tracking-tight">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50">
            <h3 className="text-lg font-black uppercase tracking-widest text-gray-900 mb-10 border-b border-gray-50 pb-6">Logistics & Billing</h3>

            <div className="space-y-12">
              <section className="space-y-6">
                <div className="flex items-center gap-3 text-primary-600">
                  <MapPin size={18} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-600">Shipping Address</h4>
                </div>
                <div className="space-y-2 text-left">
                  <p className="text-sm font-black uppercase text-gray-900">{currentOrder.shippingAddress?.name}</p>
                  <p className="text-xs font-bold text-gray-700 leading-relaxed uppercase">{currentOrder.shippingAddress?.street}</p>
                  <p className="text-xs font-bold text-gray-600 uppercase">{currentOrder.shippingAddress?.city}, {currentOrder.shippingAddress?.state} - {currentOrder.shippingAddress?.zip}</p>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 text-primary-600">
                  <CreditCard size={18} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-600">Payment Information</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-black uppercase">
                    <span className="text-gray-600">Method</span>
                    <span className="text-gray-900">{currentOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-black uppercase">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-3 py-1 rounded-full border ${getPaymentStatusStyles(currentOrder.paymentStatus || 'PENDING')}`}>
                      {currentOrder.paymentStatus || 'PENDING'}
                    </span>
                  </div>
                  {currentOrder.paymentId && (
                    <div className="flex justify-between items-center text-xs font-black uppercase">
                      <span className="text-gray-600">TXN. ID</span>
                      <span className="truncate max-w-[120px] text-gray-900">{currentOrder.paymentId}</span>
                    </div>
                  )}
                  {showMarkPaid && (
                    <button
                      onClick={handleMarkPaid}
                      className="w-full mt-4 py-3 bg-green-50 text-green-600 border border-green-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all"
                    >
                      Mark as Paid (COD)
                    </button>
                  )}
                  <div className="h-px bg-gray-50 w-full my-4" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-gray-600">Grand Total</span>
                    <span className="text-2xl font-black tracking-tighter text-primary-600">₹{Number(currentOrder.totalAmount).toLocaleString()}</span>
                  </div>
                </div>
              </section>

              <div className="pt-8 border-t border-gray-50 flex items-center gap-4 text-green-600 text-left">
                <ShieldCheck size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest font-bold">Verified Order</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[3.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">Customer Feedback</p>
                  <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Share Experience</h3>
                </div>
                <button onClick={() => { 
                  setReviewFeedback({ type: null, message: '' }); 
                  setRating(5);
                  setComment('');
                  setExistingReviewId(null);
                  setReviewModalOpen(false); 
                }} className="p-2 hover:bg-gray-50 rounded-full text-gray-400">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl">
                <img src={selectedProductForReview?.thumbnail} className="w-12 h-12 rounded-xl object-cover" alt="" />
                <p className="text-xs font-black uppercase text-gray-900 truncate">{selectedProductForReview?.name}</p>
              </div>

              {isReviewLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="w-8 h-8 border-4 border-primary-600/20 border-t-primary-600 rounded-full animate-spin" />
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-6">
                  {reviewFeedback.message && (
                    <div className={`flex items-center gap-3 p-4 rounded-2xl border animate-in fade-in zoom-in duration-300 ${
                      reviewFeedback.type === 'success' 
                        ? 'bg-green-50 text-green-600 border-green-100' 
                        : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {reviewFeedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                      <span className="text-xs font-black uppercase tracking-widest">{reviewFeedback.message}</span>
                    </div>
                  )}
                  
                  <div className="space-y-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Rating</p>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className={`p-2 transition-all ${s <= rating ? 'text-yellow-400 scale-110' : 'text-gray-200'}`}
                        >
                          <Star size={32} fill={s <= rating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Your Comment</label>
                    <textarea
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-[2rem] p-6 text-sm font-bold focus:ring-2 focus:ring-primary-600 outline-none min-h-[120px] resize-none"
                      placeholder="Tell us what you liked about this luxury piece..."
                    />
                  </div>

                  <button
                    disabled={isSubmittingReview}
                    className="w-full py-6 bg-gray-950 text-white rounded-full text-sm font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'Submitting...' : (existingReviewId ? 'Update Review' : 'Post Review')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
