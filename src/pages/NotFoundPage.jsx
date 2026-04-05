import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Compass } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <Link to="/" className="inline-flex items-center gap-2 mb-12 group">
        <div className="bg-primary-600 p-2.5 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary-100">
          <ShoppingBag className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Ecommerce</span>
      </Link>

      <div className="relative mb-8">
        <p className="text-[10rem] font-black text-gray-100 leading-none select-none tracking-tighter">
          404
        </p>
      </div>

      <div className="space-y-4 max-w-md mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">
          Page Not Found
        </h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
         This page doesn't exist.
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-3 px-10 py-5 bg-gray-950 text-white rounded-full text-sm font-black uppercase tracking-[0.2em] hover:bg-primary-600 transition-all shadow-xl shadow-gray-200 active:scale-[0.98]"
      >
        <ArrowLeft size={18} />
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
