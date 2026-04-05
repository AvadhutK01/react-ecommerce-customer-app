import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses, saveAddress } from '../../features/address/addressSlice';
import { MapPin, Plus, Edit2, Map, Navigation, Phone } from 'lucide-react';
import Loader from '../../components/common/Loader';
import AddressModal from '../../components/address/AddressModal';

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

  const handleEdit = (address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleSubmit = (values) => {
    dispatch(saveAddress({ id: editingAddress?.id, ...values })).then(() => {
      setIsModalOpen(false);
      setEditingAddress(null);
    });
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

      {isLoading && items.length === 0 ? (
        <Loader fullPage />
      ) : (
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
        </div>
      )}

      {isModalOpen && (
        <AddressModal
          editingAddress={editingAddress}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default AddressPage;
