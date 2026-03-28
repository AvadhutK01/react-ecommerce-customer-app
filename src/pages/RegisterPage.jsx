import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Loader2, AlertCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
    return () => dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Required'),
      password: Yup.string().min(6, 'Minimum 6 characters').required('Required'),
    }),
    onSubmit: (values) => {
      dispatch(registerUser(values));
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-10 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="bg-primary-600 p-2.5 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary-100">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Ecommerce</span>
          </Link>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Join the Club</h2>
          <p className="mt-3 text-sm font-bold text-gray-400 uppercase tracking-widest">Create your luxury account</p>
        </div>

        <form className="mt-8 space-y-6 text-left" onSubmit={formik.handleSubmit}>
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold uppercase tracking-wider">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-4">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  {...formik.getFieldProps('email')}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-none ring-1 rounded-2xl text-sm font-bold focus:ring-2 transition-all outline-none ${formik.touched.email && formik.errors.email ? 'ring-red-400 focus:ring-red-500' : 'ring-gray-100 focus:ring-primary-600'}`}
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-4">Created Password</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...formik.getFieldProps('password')}
                  className={`w-full pl-14 pr-14 py-4 bg-gray-50 border-none ring-1 rounded-2xl text-sm font-bold focus:ring-2 transition-all outline-none ${formik.touched.password && formik.errors.password ? 'ring-red-400 focus:ring-red-500' : 'ring-gray-100 focus:ring-primary-600'}`}
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
            className="group relative w-full flex justify-center py-5 px-4 border border-transparent text-sm font-black rounded-[2rem] text-white bg-gray-950 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all uppercase tracking-widest shadow-xl active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
              <span className="flex items-center gap-2">
                Start Exploring
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>

          <div className="text-center pt-4">
            <Link to="/login" className="text-xs font-black text-gray-500 hover:text-primary-600 uppercase tracking-widest transition-colors underline-offset-4 hover:underline">
              Already have an account? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
