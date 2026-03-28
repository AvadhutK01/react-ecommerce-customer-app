import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHomeData } from '../features/products/productSlice';
import { ArrowRight, Loader2 } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';

const HomePage = () => {
  const dispatch = useDispatch();
  const { homeCategories, isLoading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchHomeData());
  }, [dispatch]);

  if (isLoading && homeCategories.length === 0) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-16 py-10 pb-20">
      {homeCategories.map((category) => (
        <section key={category.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10 text-left">
            <div>
              <p className="text-xs font-black text-primary-600 uppercase tracking-[0.3em] mb-2">Discover</p>
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">{category.name}</h2>
              <div className="h-1 w-20 bg-primary-600 mt-2 rounded-full" />
            </div>
            <button className="group flex items-center gap-2 text-sm font-black text-gray-900 hover:text-primary-600 transition-colors uppercase tracking-widest">
              Show More 
              <span className="p-2 bg-gray-900 text-white rounded-full group-hover:bg-primary-600 transition-colors">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {category.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}
      
      {homeCategories.length === 0 && !isLoading && (
        <div className="py-20 text-center">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No collections found</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
