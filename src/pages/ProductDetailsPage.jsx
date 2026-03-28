import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails, fetchCategoryDetails } from '../features/products/productSlice';
import { Star, Loader2, ShoppingCart, Zap, ChevronRight, Heart } from 'lucide-react';

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct, currentCategory, isLoading } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    dispatch(fetchProductDetails(productId));
    window.scrollTo(0, 0);
  }, [dispatch, productId]);

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

  const handleProtectedAction = (action) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      // Logic for adding to cart or buying will go here in Phase 5
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
          <div className="aspect-square rounded-[3rem] overflow-hidden bg-white border border-gray-100 shadow-sm relative group">
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
                  {currentProduct.subcategory || 'Electronics'}
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
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                ))}
                <span className="ml-2 text-sm font-bold text-gray-500 tracking-tight">(4.8 / 120 reviews)</span>
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
    </div>
  );
};

export default ProductDetailsPage;
