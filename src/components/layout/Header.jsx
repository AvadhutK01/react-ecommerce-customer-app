import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, ShoppingCart, Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary-100">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase">
                Ecommerce
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors uppercase tracking-widest">Home</Link>
            </nav>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="w-full relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border-none ring-1 ring-gray-100 pl-12 pr-4 py-3 rounded-full text-sm font-bold focus:ring-2 focus:ring-primary-600 transition-all outline-none"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-3 hover:bg-gray-50 rounded-full text-gray-500 hover:text-primary-600 transition-all relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-primary-600 rounded-full border-2 border-white" />
            </button>

            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-gray-100">
              <button className="px-6 py-2.5 text-sm font-black text-gray-900 hover:text-primary-600 uppercase tracking-widest transition-all">
                Login
              </button>
              <button className="px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-gray-200">
                Join
              </button>
            </div>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 hover:bg-gray-50 rounded-full text-gray-900 transition-all"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden bg-white border-t border-gray-100 transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-none ring-1 ring-gray-100 pl-12 pr-4 py-3 rounded-full text-sm font-bold focus:ring-2 focus:ring-primary-600 transition-all outline-none"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <div className="flex flex-col gap-2 pt-4 border-t border-gray-50">
            <button className="w-full py-3 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Login</button>
            <button className="w-full py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">Join Now</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
