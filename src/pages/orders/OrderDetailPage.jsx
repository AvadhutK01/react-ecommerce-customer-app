import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetail, clearCurrentOrder, updateOrderThunk, cancelOrderThunk } from '../../features/orders/orderSlice';
import { fetchUserProductReview, submitReview } from '../../features/reviews/reviewSlice';
import { ChevronLeft, Box, CreditCard, MapPin, XCircle, Star, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { ORDER_STATUS, PAYMENT_STATUS, getOrderStatusStyles, getPaymentStatusStyles } from '../../utils/statusStyles';
import Loader from '../../components/common/Loader';

import ReviewModal from '../../components/products/ReviewModal';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentOrder, isDetailLoading, isCancelling } = useSelector((state) => state.orders);
  const { userReview, isFetchingUserReview, isSubmitting } = useSelector((state) => state.reviews);

  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState({ type: null, message: '' });
  const [reviewedProductIds, setReviewedProductIds] = useState(new Set());

  useEffect(() => {
    dispatch(fetchOrderDetail(orderId));
    return () => dispatch(clearCurrentOrder());
  }, [dispatch, orderId]);

  useEffect(() => {
    if (currentOrder?.status === ORDER_STATUS.DELIVERED && user?.uid) {
      Promise.all(
        currentOrder.items.map(async (item) => {
          const r = await dispatch(fetchUserProductReview({ userId: user.uid, productId: item.id })).unwrap();
          return { id: item.id, hasReview: !!r };
        })
      ).then((statuses) => {
        setReviewedProductIds(new Set(statuses.filter((s) => s.hasReview).map((s) => s.id)));
      });
    }
  }, [currentOrder, user?.uid, dispatch]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    const updateData = {
      status: ORDER_STATUS.CANCELLED,
      ...(currentOrder.paymentMethod === 'ONLINE' && { paymentStatus: PAYMENT_STATUS.REFUNDED }),
    };
    dispatch(cancelOrderThunk({ orderId, updateData, items: currentOrder.items }));
  };

  const handleMarkPaid = () => {
    dispatch(updateOrderThunk({ orderId, data: { paymentStatus: PAYMENT_STATUS.PAID } }));
  };

  const handleOpenReviewModal = (product) => {
    setSelectedProductForReview(product);
    setReviewFeedback({ type: null, message: '' });
    setReviewModalOpen(true);
    dispatch(fetchUserProductReview({ userId: user.uid, productId: product.id }));
  };

  const handleCloseModal = () => {
    setReviewModalOpen(false);
    setSelectedProductForReview(null);
    setReviewFeedback({ type: null, message: '' });
  };

  const handleSubmitReview = async ({ rating, comment }) => {
    const reviewPayload = {
      productId: selectedProductForReview.id,
      userId: user.uid,
      userName: user.name,
      rating,
      comment,
      ...(userReview ? { updatedAt: new Date().toISOString() } : { createdAt: new Date().toISOString() }),
    };

    const result = await dispatch(submitReview({ reviewId: userReview?.id, payload: reviewPayload }));
    if (!result.error) {
      setReviewFeedback({ type: 'success', message: userReview ? 'Review updated!' : 'Review submitted!' });
      setReviewedProductIds((prev) => new Set([...prev, selectedProductForReview.id]));
      setTimeout(handleCloseModal, 2000);
    } else {
      setReviewFeedback({ type: 'error', message: 'Failed to submit review' });
    }
  };

  if (isDetailLoading) return <Loader fullPage />;
  if (!currentOrder) return null;

  const canCancel = [ORDER_STATUS.PENDING, ORDER_STATUS.PROCESSING].includes(currentOrder.status);
  const canReview = currentOrder.status === ORDER_STATUS.DELIVERED;
  const showMarkPaid =
    currentOrder.status === ORDER_STATUS.DELIVERED &&
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
              <h1 className="text-2xl sm:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                Order #{currentOrder.id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                Placed on {new Date(currentOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {canCancel && (
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex items-center gap-2 px-8 py-4 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-100 disabled:opacity-50"
              >
                {isCancelling ? <Loader size="sm" /> : <XCircle size={16} />}
                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
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

              <div className="pt-8 border-t border-gray-50 flex items-center gap-4 text-green-600">
                <ShieldCheck size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Verified Order</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleCloseModal}
        product={selectedProductForReview}
        user={user}
        userReview={userReview}
        isFetching={isFetchingUserReview}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitReview}
        feedback={reviewFeedback}
      />
    </div>
  );
};

export default OrderDetailPage;
