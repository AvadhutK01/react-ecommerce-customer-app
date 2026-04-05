import React from 'react';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { MapPin, Phone, User, Check, X } from 'lucide-react';
import Loader from '../common/Loader';

const AddressModal = ({ editingAddress, onSubmit, onClose }) => {
  const { isLoading } = useSelector((state) => state.addresses);

  const formik = useFormik({
    initialValues: {
      name: editingAddress?.name || '',
      phone: editingAddress?.phone || '',
      street: editingAddress?.street || '',
      city: editingAddress?.city || '',
      state: editingAddress?.state || '',
      zip: editingAddress?.zip || '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      phone: Yup.string().required('Required'),
      street: Yup.string().required('Required'),
      city: Yup.string().required('Required'),
      state: Yup.string().required('Required'),
      zip: Yup.string().required('Required'),
    }),
    onSubmit,
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div
        key={editingAddress?.id || 'new'}
        className="relative bg-white w-full max-w-2xl p-6 sm:p-12 rounded-[2rem] sm:rounded-[3.5rem] border border-gray-100 shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto overflow-x-hidden custom-scrollbar"
      >
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">
            {editingAddress ? 'Modify Address' : 'New Destination'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 sm:p-3 hover:bg-gray-50 rounded-full text-gray-400 hover:text-red-500 transition-all"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-5 sm:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Recipient Name</label>
              <div className="relative">
                <User size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  {...formik.getFieldProps('name')}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-600 transition-all outline-none"
                  placeholder="Full Name"
                />
              </div>
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  {...formik.getFieldProps('phone')}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-600 transition-all outline-none"
                  placeholder="+91 00000 00000"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Street Address</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                {...formik.getFieldProps('street')}
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-600 transition-all outline-none"
                placeholder="Apartment, Street, Area"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">City</label>
              <input
                {...formik.getFieldProps('city')}
                className="w-full px-6 py-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-600 transition-all outline-none"
                placeholder="City"
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">State</label>
              <input
                {...formik.getFieldProps('state')}
                className="w-full px-6 py-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-600 transition-all outline-none"
                placeholder="State"
              />
            </div>
            <div className="sm:col-span-2 md:col-span-1 space-y-2 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">ZIP Code</label>
              <input
                {...formik.getFieldProps('zip')}
                className="w-full px-6 py-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-600 transition-all outline-none"
                placeholder="000000"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-5 bg-gray-950 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? <Loader size="sm" className="border-white border-t-white/30" /> : <Check size={20} />}
              Save Location
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;
