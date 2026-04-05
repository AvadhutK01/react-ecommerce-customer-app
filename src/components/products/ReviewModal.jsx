import React, { useState, useEffect } from 'react';
import { XCircle, Star, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import Loader from '../common/Loader';

const ReviewModal = ({
  isOpen,
  onClose,
  product,
  user,
  userReview,
  isFetching,
  isSubmitting,
  onSubmit,
  feedback
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment);
    } else {
      setRating(5);
      setComment('');
    }
  }, [userReview, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, comment });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-md shadow-2xl animate-in zoom-in duration-300 border border-gray-100 overflow-hidden rounded-[32px]"
      >
        <div className="p-5 space-y-5">
          <div className="flex justify-between items-start">
            <div className="space-y-1 text-left">
              <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">Customer Feedback</p>
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Share Experience</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 transition-colors">
              <XCircle size={22} />
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
            <img src={product?.thumbnail} className="w-10 h-10 rounded-lg object-cover" alt="" />
            <p className="text-xs font-black uppercase text-gray-900 truncate flex-1 text-left">{product?.name}</p>
          </div>

          {isFetching ? (
            <div className="flex justify-center items-center py-8">
              <Loader size="md" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {feedback.message && (
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${feedback.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                  {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span className="text-xs font-black uppercase tracking-widest">{feedback.message}</span>
                </div>
              )}

              <div className="space-y-2 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Rating</p>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className={`p-1 transition-all ${s <= rating ? 'text-yellow-400 scale-110' : 'text-gray-200'}`}
                    >
                      <Star size={26} fill={s <= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Your Comment</label>
                <textarea
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary-600 outline-none min-h-[90px] resize-none"
                  placeholder="Tell us what you liked..."
                />
              </div>

              <button
                disabled={isSubmitting}
                className="w-full py-4 bg-gray-950 text-white rounded-full text-sm font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader size="sm" className="border-white border-t-white/30" /> : <MessageSquare size={16} />}
                {isSubmitting ? 'Submitting...' : (userReview ? 'Update Review' : 'Post Review')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;