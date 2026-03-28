import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses, saveAddress } from '../features/addresses/addressSlice';
import { MapPin, Plus, Edit2, Loader2, Map, Navigation, Phone, User, Check, X } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const AddressPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, isLoading } = useSelector((state) => state.addresses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchAddresses(user.uid));
    }
  }, [dispatch, user]);

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
    onSubmit: (values) => {
      dispatch(saveAddress({ id: editingAddress?.id, ...values })).then(() => {
        setIsModalOpen(false);
        setEditingAddress(null);
      });
    },
  });

  const handleEdit = (address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left relative min-h-[80vh]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">Shipping Details</p>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">Manage Addresses</h1>
          <div className="h-1.5 w-32 bg-primary-600 rounded-full" />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-950 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl active:scale-[0.98]"
        >
          <Plus size={18} />
          Add New Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((address) => (
          <div key={address.id} className="relative group">
            <div className="h-full bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/20 hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                  <Navigation size={20} />
                </div>
                <button
                  onClick={() => handleEdit(address)}
                  className="p-3 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all"
                >
                  <Edit2 size={18} />
                </button>
              </div>

              <div className="space-y-4 flex-1">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{address.name}</h3>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-gray-500 leading-relaxed uppercase tracking-tighter line-clamp-2">
                    {address.street}
                  </p>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                    {address.city}, {address.state} - {address.zip}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center gap-3 text-gray-400">
                <Phone size={14} />
                <span className="text-xs font-black uppercase tracking-widest">{address.phone}</span>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && !isLoading && (
          <div className="col-span-full py-20 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-6 bg-white rounded-full shadow-sm text-gray-200">
              <Map size={48} />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-black text-gray-400 uppercase tracking-widest">No Addresses Saved</p>
              <p className="text-sm font-bold text-gray-300 uppercase tracking-tighter">Your shipping locations will appear here</p>
            </div>
          </div>
        )}

        {isLoading && items.length === 0 && (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 className="animate-spin h-10 w-10 text-primary-600" />
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-2xl p-8 sm:p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl animate-in fade-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
                {editingAddress ? 'Modify Address' : 'New Destination'}
              </h2>
              <button 
                onClick={closeModal} 
                className="p-3 hover:bg-gray-50 rounded-full text-gray-400 hover:text-red-500 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
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
                <div className="space-y-2">
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

              <div className="space-y-2">
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

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">City</label>
                  <input 
                    {...formik.getFieldProps('city')} 
                    className="w-full px-6 py-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-600 transition-all outline-none" 
                    placeholder="City" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">State</label>
                  <input 
                    {...formik.getFieldProps('state')} 
                    className="w-full px-6 py-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-600 transition-all outline-none" 
                    placeholder="State" 
                  />
                </div>
                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">ZIP Code</label>
                  <input 
                    {...formik.getFieldProps('zip')} 
                    className="w-full px-6 py-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-600 transition-all outline-none" 
                    placeholder="000000" 
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-3 py-5 bg-gray-950 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Check size={20} />}
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressPage;
