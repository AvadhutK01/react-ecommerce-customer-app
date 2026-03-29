import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails, fetchCategoryDetails } from '../features/products/productSlice';
import { addItem } from '../features/cart/cartSlice';
import { Star, Loader2, ShoppingCart, Zap, ChevronRight, Heart, ShieldAlert, MessageSquare, User, Calendar } from 'lucide-react';
import * as reviewService from '../api/reviewService';

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct, currentCategory, isLoading } = useSelector((state) => state.products);
  const { isAuthenticated, isVerified } = useSelector((state) => state.auth);
  
  const [activeImage, setActiveImage] = useState(0);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isReviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchProductDetails(productId));
    loadReviews();
    window.scrollTo(0, 0);
  }, [dispatch, productId]);

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const data = await reviewService.getReviewsByProduct(productId);
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (currentProduct?.categoryId) {
      dispatch(fetchCategoryDetails(currentProduct.categoryId));
    }
  }, [dispatch, currentProduct]);

  const images = useMemo(() => {
    if (!currentProduct) return [];
    const gallery = currentProduct.images || [];
    if (gallery.length > 0) return gallery;
    return [currentProduct.thumbnail];
  }, [currentProduct]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, rev) => acc + (rev.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const handleProtectedAction = (action) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (action === 'buy' && !isVerified) {
      setError('Please verify your email from the profile page to place orders.');
      setTimeout(() => navigate('/profile'), 3000);
      return;
    }

    const cartItem = {
      id: currentProduct.id,
      name: currentProduct.name,
      price: Number(currentProduct.price),
      thumbnail: currentProduct.thumbnail,
    };

    dispatch(addItem(cartItem));

    if (action === 'buy') {
      navigate('/checkout');
    }
  };

  if (isLoading && !currentProduct) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!currentProduct) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <ChevronRight size={10} />
        <Link to={`/category/${currentProduct.categoryId}`} className="hover:text-primary-600 transition-colors">
          {currentCategory?.name || 'Collection'}
        </Link>
        <ChevronRight size={10} />
        <span className="text-gray-900">{currentProduct.subcategory}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-6">
          <div className="aspect-square rounded-[3.5rem] overflow-hidden bg-white border border-gray-100 shadow-sm relative group">
            <img 
              src={images[activeImage]} 
              alt={currentProduct.name} 
              className="w-full h-full object-cover transition-all duration-700" 
            />
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary-600 shadow-lg' : 'border-transparent hover:border-gray-200'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="text-left py-4">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-4 py-1.5 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                  {currentProduct.subcategory}
                </span>
                {Number(currentProduct.stock) > 0 ? (
                  <span className="flex items-center gap-1.5 text-green-500 text-[10px] font-black uppercase tracking-widest">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                    In Stock
                  </span>
                ) : (
                  <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">Out of Stock</span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-tight">
                {currentProduct.name}
              </h1>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                  ))}
                </div>
                <span className="ml-2 text-xs font-black text-gray-900 tracking-tight uppercase">
                  {averageRating} <span className="text-gray-400 font-bold ml-1">/ {reviews.length} reviews</span>
                </span>
              </div>
            </div>

            <div className="py-8 border-y border-gray-100">
              <p className="text-6xl font-black text-gray-900 tracking-tight">
                ₹{Number(currentProduct.price).toLocaleString()}
              </p>
            </div>

            <p className="text-gray-500 text-lg leading-relaxed font-medium">
              {currentProduct.description}
            </p>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                <ShieldAlert size={18} />
                <span className="text-xs font-black uppercase tracking-widest">{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => handleProtectedAction('cart')}
                className="flex-1 py-5 bg-gray-950 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-gray-200 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>
              <button 
                onClick={() => handleProtectedAction('buy')}
                className="flex-1 py-5 bg-primary-600 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-50 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <Zap size={20} />
                Buy It Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-32 border-t border-gray-100 pt-32 text-left">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">Customer Voice</p>
            <h2 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">Reviews & Ratings</h2>
            <div className="h-2 w-40 bg-primary-600 rounded-full" />
          </div>
          
          <div className="flex items-center gap-8 px-10 py-6 bg-gray-50 rounded-[2.5rem]">
            <div className="text-center">
              <p className="text-4xl font-black text-gray-900 tracking-tighter">{averageRating}</p>
              <div className="flex justify-center gap-0.5 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} className={i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                ))}
              </div>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-tight">
              Based on <br /> <span className="text-gray-900">{reviews.length} Verified Purchases</span>
            </p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="py-20 text-center bg-gray-50 rounded-[3.5rem] border border-dashed border-gray-200">
             <MessageSquare size={48} className="mx-auto text-gray-200 mb-6" />
             <p className="text-xs font-black uppercase tracking-widest text-gray-400">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/20 space-y-6 group hover:border-primary-100 transition-all duration-500">
                 <div className="flex justify-between items-start">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 font-black uppercase italic group-hover:bg-primary-600 group-hover:text-white transition-all">
                       {review.userName?.charAt(0) || <User size={20} />}
                     </div>
                     <div>
                       <p className="text-xs font-black uppercase text-gray-900 tracking-tight">{review.userName || 'Anonymous'}</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                         <Calendar size={10} />
                         {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                       </p>
                     </div>
                   </div>
                   <div className="flex items-center gap-0.5">
                     {[...Array(5)].map((_, i) => (
                       <Star key={i} size={12} className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-100'} />
                     ))}
                   </div>
                 </div>
                 <p className="text-gray-600 leading-relaxed font-medium">"{review.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsPage;
