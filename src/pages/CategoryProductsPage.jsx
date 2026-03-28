import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategoryProducts, fetchCategoryDetails, resetCategoryProgress } from '../features/products/productSlice';
import ProductCard from '../components/products/ProductCard';
import { Search, Loader2 } from 'lucide-react';

const CategoryProductsPage = () => {
  const { categoryId } = useParams();
  const dispatch = useDispatch();
  const observer = useRef();
  
  const { 
    categoryProducts, 
    currentCategory,
    isLoading, 
    isPaginating, 
    hasMore, 
    currentPage,
    searchTerm 
  } = useSelector((state) => state.products);
  
  const [priceRange, setPriceRange] = useState(200000);
  const [selectedSubcats, setSelectedSubcats] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    dispatch(resetCategoryProgress());
    dispatch(fetchCategoryDetails(categoryId));
    dispatch(fetchCategoryProducts({ categoryId, page: 0 }));
  }, [dispatch, categoryId]);

  const lastElementRef = useCallback(node => {
    if (isLoading || isPaginating) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        dispatch(fetchCategoryProducts({ categoryId, page: currentPage + 1 }));
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, isPaginating, hasMore, currentPage, dispatch, categoryId]);

  const subcategories = useMemo(() => {
    return [...new Set(categoryProducts.map(p => p.subcategory))].filter(Boolean);
  }, [categoryProducts]);

  const filteredProducts = useMemo(() => {
    let products = [...categoryProducts];

    if (searchTerm.trim()) {
      const regex = new RegExp(searchTerm, 'i');
      products = products.filter(p => regex.test(p.name));
    }

    products = products.filter(p => Number(p.price) <= priceRange);

    if (selectedSubcats.length > 0) {
      products = products.filter(p => selectedSubcats.includes(p.subcategory));
    }

    if (sortBy === 'price-low') products.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') products.sort((a, b) => b.price - a.price);
    
    return products;
  }, [categoryProducts, searchTerm, priceRange, selectedSubcats, sortBy]);

  if (isLoading && categoryProducts.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-left">
        <div className="space-y-4">
          <p className="text-xs font-black text-primary-600 uppercase tracking-[0.3em]">Browsing</p>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter uppercase">
            {currentCategory?.name || 'Collection'}
          </h1>
          <div className="h-1.5 w-32 bg-primary-600 rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-6 py-3 bg-white border border-gray-100 rounded-full font-bold outline-none focus:ring-4 focus:ring-primary-50 transition-all text-sm appearance-none cursor-pointer"
          >
            <option value="newest">Sort: Newest</option>
            <option value="price-low">Price: Low - High</option>
            <option value="price-high">Price: High - Low</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-72 space-y-10 block">
          <div className="space-y-8 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm text-left sticky top-28">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Price Ceiling</h3>
              <div className="space-y-4">
                <input 
                  type="range" 
                  min="0" 
                  max="200000" 
                  step="5000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <p className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-xl inline-block">
                  Under ₹{priceRange.toLocaleString()}
                </p>
              </div>
            </div>

            {subcategories.length > 0 && (
              <div className="pt-8 border-t border-gray-50">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Sub-Types</h3>
                <div className="space-y-3">
                  {subcategories.map(sub => (
                    <label key={sub} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-lg border-gray-200 text-primary-600 focus:ring-primary-400"
                        checked={selectedSubcats.includes(sub)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedSubcats([...selectedSubcats, sub]);
                          else setSelectedSubcats(selectedSubcats.filter(s => s !== sub));
                        }}
                      />
                      <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600 transition-colors uppercase tracking-wider">{sub}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={() => { setPriceRange(200000); setSelectedSubcats([]); }}
              className="w-full pt-4 text-xs font-black text-red-500 hover:text-red-600 uppercase tracking-widest transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </aside>

        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, index) => {
                const isLast = filteredProducts.length === index + 1;
                return (
                  <div key={product.id} ref={isLast ? lastElementRef : null}>
                    <ProductCard product={product} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm">
              <Search className="h-12 w-12 text-gray-200 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">
                {searchTerm ? `No results for "${searchTerm}"` : 'Try broadening your filters'}
              </p>
            </div>
          )}

          {isPaginating && (
            <div className="py-10 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) }
        </div>
      </div>
    </div>
  );
};

export default CategoryProductsPage;
