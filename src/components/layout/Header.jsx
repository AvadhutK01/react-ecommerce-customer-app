import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchTerm } from '../../features/products/productSlice';
import { logout } from '../../features/auth/authSlice';
import { ShoppingBag, Search, ShoppingCart, Menu, X, LogOut, User, MapPin } from 'lucide-react';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalQuantity } = useSelector((state) => state.cart);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(setSearchTerm(searchQuery));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(setSearchTerm(searchQuery));
  };

  const handleCartClick = () => {
    if (!isAuthenticated) navigate('/login');
    else navigate('/cart');
  };

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
            <form onSubmit={handleSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border-none ring-1 ring-gray-100 pl-12 pr-4 py-3 rounded-full text-sm font-bold focus:ring-2 focus:ring-primary-600 transition-all outline-none"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleCartClick}
              className="p-3 hover:bg-gray-50 rounded-full text-gray-500 hover:text-primary-600 transition-all relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalQuantity > 0 && (
                <span className="absolute top-1 right-1 h-5 w-5 bg-primary-600 text-[10px] font-black text-white rounded-full border-2 border-white flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </button>

            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-gray-100">
              {isAuthenticated ? (
                <div className="flex items-center gap-4 ml-4">
                   <div className="relative group/profile flex items-center gap-3 cursor-pointer">
                     <Link to="/profile" className="flex items-center gap-3">
                       <div className="h-8 w-8 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
                         <User size={16} />
                       </div>
                       <span className="text-xs font-black uppercase text-gray-900 truncate max-w-[100px] border-b-2 border-transparent group-hover:border-primary-600 transition-all">{user.name}</span>
                     </Link>
                     
                     <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-[2rem] shadow-2xl shadow-gray-200 border border-gray-100 opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-300 py-4 z-50 overflow-hidden">
                        <Link to="/profile" className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors text-xs font-black uppercase tracking-widest text-gray-900">
                          <User size={16} className="text-primary-600" />
                          My Profile
                        </Link>
                        <Link to="/addresses" className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors text-xs font-black uppercase tracking-widest text-gray-900">
                          <MapPin size={16} className="text-primary-600" />
                          Addresses
                        </Link>
                        <button 
                          onClick={() => dispatch(logout())}
                          className="w-full flex items-center gap-3 px-6 py-4 hover:bg-red-50 transition-colors text-xs font-black uppercase tracking-widest text-red-500 border-t border-gray-50 mt-2 pt-4"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                     </div>
                   </div>
                </div>
              ) : (
                <>
                  <Link to="/login" className="px-6 py-2.5 text-sm font-black text-gray-900 hover:text-primary-600 uppercase tracking-widest transition-all">
                    Login
                  </Link>
                  <Link to="/register" className="px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-gray-200">
                    Join
                  </Link>
                </>
              )}
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

      <div className={`md:hidden bg-white border-t border-gray-100 transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-[30rem] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 space-y-4 text-left">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-none ring-1 ring-gray-100 pl-12 pr-4 py-3 rounded-full text-sm font-bold focus:ring-2 focus:ring-primary-600 transition-all outline-none"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </form>
          <div className="flex flex-col gap-2 pt-4 border-t border-gray-50">
            {isAuthenticated ? (
               <>
                 <Link to="/profile" className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl mb-2">
                    <User size={18} className="text-primary-600" />
                    <span className="text-sm font-black uppercase text-gray-900">{user.name}</span>
                 </Link>
                 <Link to="/addresses" className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors text-xs font-black uppercase tracking-widest text-gray-900 rounded-2xl">
                    <MapPin size={18} className="text-primary-600" />
                    Manage Addresses
                 </Link>
                 <button 
                  onClick={() => dispatch(logout())}
                  className="w-full py-4 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]"
                 >
                   Logout
                 </button>
               </>
            ) : (
              <>
                <Link to="/login" className="w-full py-4 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 text-center">Login</Link>
                <Link to="/register" className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-center">Join Now</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
