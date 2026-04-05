import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, sendVerificationEmail, checkAuthStatus, clearError } from '../../features/auth/authSlice';
import { User, Mail, ShieldCheck, ShieldAlert, CheckCircle, Save, Send } from 'lucide-react';
import Loader from '../../components/common/Loader';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, isUpdating, isSendingVerification, error, isVerified, verificationSent } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
    return () => dispatch(clearError());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: { name: user?.name || '' },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required').min(2, 'Too short'),
    }),
    onSubmit: (values) => {
      dispatch(updateProfile(values));
    },
  });

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="space-y-12">
        <div className="text-left space-y-4">
          <p className="text-xs font-black text-primary-600 uppercase tracking-[0.3em]">Personal Account</p>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">Profile Settings</h1>
          <div className="h-1.5 w-32 bg-primary-600 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 text-left">
              <form onSubmit={formik.handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div className="relative">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-4">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                      <input
                        {...formik.getFieldProps('name')}
                        className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none ring-1 ring-gray-100 rounded-[2rem] text-sm font-bold focus:ring-2 focus:ring-primary-600 transition-all outline-none"
                        placeholder="Your Name"
                      />
                    </div>
                  </div>

                  <div className="relative opacity-60">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-4">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                      <input
                        disabled
                        value={user.email}
                        className="w-full pl-16 pr-6 py-5 bg-gray-100 border-none ring-1 ring-gray-200 rounded-[2rem] text-sm font-bold outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-50 p-4 rounded-2xl">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isUpdating || !formik.dirty}
                  className="flex items-center justify-center gap-3 w-full py-5 bg-gray-950 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isUpdating ? <Loader size="sm" className="border-white border-t-white/30" /> : <Save size={18} />}
                  Save Changes
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-8">
            <div className={`p-10 rounded-[3rem] border transition-all text-left space-y-6 ${isVerified ? 'bg-green-50/50 border-green-100' : 'bg-orange-50/50 border-orange-100'}`}>
              <div className="flex items-center justify-between">
                {isVerified ? (
                  <ShieldCheck className="h-10 w-10 text-green-500" />
                ) : (
                  <ShieldAlert className="h-10 w-10 text-orange-500" />
                )}
                <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${isVerified ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                  {isVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-gray-900 uppercase">Email Security</h3>
                <p className="text-xs font-bold text-gray-500 leading-relaxed">
                  {isVerified
                    ? 'Your email is verified. You can place orders and explore products.'
                    : 'Your email has not been verified yet. Check your inbox or request a new verification link.'}
                </p>
              </div>

              {!isVerified && (
                <button
                  onClick={() => dispatch(sendVerificationEmail())}
                  disabled={isSendingVerification || verificationSent}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-orange-200 text-orange-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all disabled:opacity-50"
                >
                  {isSendingVerification ? <Loader size="sm" /> : (verificationSent ? (
                    <>
                      <CheckCircle size={14} />
                      Link Sent
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send Link
                    </>
                  ))}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
