import React from 'react';
import { Star } from 'lucide-react';

const ProductCard = ({ product }) => {
  return (
    <div className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-1">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img 
          src={product.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2070&auto=format&fit=crop'} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg">
            Low Stock
          </div>
        )}
      </div>
      
      <div className="p-6 text-left">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{product.subcategory || 'Collection'}</p>
          <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 border-none" />
            4.8
          </div>
        </div>
        <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1 mb-2">
          {product.name}
        </h3>
        <p className="text-xl font-black text-gray-900">₹{Number(product.price).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default ProductCard;
