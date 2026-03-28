import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, forgotPassword, clearError, resetForgotStatus } from '../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, Mail, CheckCircle, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  
  const { isLoading, error, isAuthenticated, isForgotPasswordLoading, forgotPasswordSent } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
    return () => {
      dispatch(clearError());
      dispatch(resetForgotStatus());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const loginFormik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Required'),
      password: Yup.string().min(6, 'Minimum 6 characters').required('Required'),
    }),
    onSubmit: (values) => {
      dispatch(loginUser(values));
    },
  });

  const resetFormik = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Required'),
    }),
    onSubmit: (values) => {
      dispatch(forgotPassword(values.email));
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 text-left">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="bg-primary-600 p-2.5 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary-100">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Ecommerce</span>
          </Link>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
            {isResetMode ? 'Reset Account' : 'Welcome Back'}
          </h2>
          <p className="mt-3 text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed px-4">
            {isResetMode ? 'Enter email to receive reset link' : 'Login to your luxury account'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-[10px] font-black uppercase tracking-wider">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {isResetMode ? (
          <div className="space-y-6">
            {forgotPasswordSent ? (
              <div className="space-y-8 pt-4">
                <div className="p-6 bg-green-50 border border-green-100 rounded-[2rem] text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white mb-2 shadow-lg shadow-green-100">
                    <CheckCircle size={24} />
                  </div>
                  <h3 className="text-sm font-black text-green-700 uppercase tracking-widest">Link Dispatched</h3>
                  <p className="text-xs font-bold text-green-600/80 leading-relaxed uppercase tracking-tighter">Please check your inbox <br/>(and spam folder)</p>
                </div>
                <button
                  onClick={() => setIsResetMode(false)}
                  className="w-full flex items-center justify-center gap-2 text-xs font-black text-primary-600 uppercase tracking-[0.2em] hover:text-primary-700 transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to Login
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={resetFormik.handleSubmit}>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-4">Account Email</label>
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <input
                      {...resetFormik.getFieldProps('email')}
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-600 transition-all outline-none"
                      placeholder="alex@example.com"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isForgotPasswordLoading}
                  className="w-full flex justify-center py-5 px-4 border border-transparent text-sm font-black rounded-[2rem] text-white bg-gray-950 hover:bg-primary-600 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
                >
                  {isForgotPasswordLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Send Recovery Link'}
                </button>
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetMode(false)}
                    className="text-[10px] font-black text-gray-400 hover:text-primary-600 uppercase tracking-[0.2em] transition-colors"
                  >
                    Cancel and Return
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={loginFormik.handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-4">Email Address</label>
                <input
                  {...loginFormik.getFieldProps('email')}
                  className={`w-full px-6 py-4 bg-gray-50 border-none ring-1 rounded-2xl text-sm font-bold focus:ring-2 transition-all outline-none ${loginFormik.touched.email && loginFormik.errors.email ? 'ring-red-400 focus:ring-red-500' : 'ring-gray-100 focus:ring-primary-600'}`}
                  placeholder="alex@example.com"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2 px-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsResetMode(true)}
                    className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-[0.1em] transition-colors"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...loginFormik.getFieldProps('password')}
                    className={`w-full pl-6 pr-14 py-4 bg-gray-50 border-none ring-1 rounded-2xl text-sm font-bold focus:ring-2 transition-all outline-none ${loginFormik.touched.password && loginFormik.errors.password ? 'ring-red-400 focus:ring-red-500' : 'ring-gray-100 focus:ring-primary-600'}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-5 px-4 border border-transparent text-sm font-black rounded-[2rem] text-white bg-gray-950 hover:bg-primary-600 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <span className="flex items-center gap-2 lowercase first-letter:uppercase">
                  Login to Store
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>

            <div className="text-center pt-4">
              <Link to="/register" className="text-xs font-black text-gray-500 hover:text-primary-600 uppercase tracking-widest transition-colors underline-offset-4 hover:underline">
                New here? Create account
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
