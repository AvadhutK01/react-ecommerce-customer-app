import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHomeData } from '../../features/products/productSlice';
import { ArrowRight, Search } from 'lucide-react';
import Loader from '../../components/common/Loader';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/products/ProductCard';

const HomePage = () => {
  const dispatch = useDispatch();
  const { homeCategories, isLoading, searchTerm } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchHomeData());
  }, [dispatch]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return homeCategories;
    
    const regex = new RegExp(searchTerm, 'i');
    return homeCategories
      .map(cat => ({
        ...cat,
        products: cat.products.filter(p => regex.test(p.name))
      }))
      .filter(cat => cat.products.length > 0);
  }, [homeCategories, searchTerm]);

  if (isLoading && homeCategories.length === 0) {
    return <Loader fullPage />;
  }

  return (
    <div className="space-y-16 py-10 pb-20">
      {filteredCategories.map((category) => (
        <section key={category.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 text-left">
            <div>
              <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] mb-2">Discover</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter uppercase">{category.name}</h2>
              <div className="h-1 w-20 bg-primary-600 mt-2 rounded-full" />
            </div>
            <Link 
              to={`/category/${category.id}`}
              className="group flex items-center gap-3 text-[10px] font-black text-gray-950 hover:text-primary-600 transition-colors uppercase tracking-widest bg-gray-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl sm:rounded-none"
            >
              Show Collection
              <span className="p-2 bg-gray-950 text-white rounded-full group-hover:bg-primary-600 transition-colors">
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {category.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}
      
      {filteredCategories.length === 0 && (
        <div className="py-32 text-center max-w-7xl mx-auto px-4">
          <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">No Results Found</h3>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Try adjusting your search for "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
