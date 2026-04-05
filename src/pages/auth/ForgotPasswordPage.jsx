import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, clearError, resetForgotStatus } from '../../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, AlertCircle, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import Loader from '../../components/common/Loader';

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { error, isAuthenticated, isForgotPasswordLoading, forgotPasswordSent } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
    return () => {
      dispatch(clearError());
      dispatch(resetForgotStatus());
    };
  }, [isAuthenticated, navigate, dispatch]);

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
            Reset Account
          </h2>
          <p className="mt-3 text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed px-4">
            Enter email to receive reset link
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-[10px] font-black uppercase tracking-wider">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

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
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2 text-xs font-black text-primary-600 uppercase tracking-[0.2em] hover:text-primary-700 transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Login
              </Link>
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
                    placeholder="user@example.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isForgotPasswordLoading}
                className="w-full flex justify-center py-5 px-4 border border-transparent text-sm font-black rounded-[2rem] text-white bg-gray-950 hover:bg-primary-600 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
              >
                {isForgotPasswordLoading ? <Loader size="sm" className="border-white border-t-white/30" /> : 'Send Recovery Link'}
              </button>
              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-[10px] font-black text-gray-400 hover:text-primary-600 uppercase tracking-[0.2em] transition-colors"
                >
                  Cancel and Return
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
