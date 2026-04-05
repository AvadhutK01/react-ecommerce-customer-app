import { firestoreApi } from '../../api/axiosInstance';
import ENDPOINTS from '../../api/endpoints';

const mapFirestoreDoc = (doc) => ({
  id: doc.name.split('/').pop(),
  ...Object.keys(doc.fields).reduce((acc, key) => {
    const field = doc.fields[key];
    acc[key] = field.stringValue || field.integerValue || field.doubleValue || field.booleanValue;
    return acc;
  }, {})
});

const getAddresses = async (userId) => {
  const query = {
    structuredQuery: {
      from: [{ collectionId: 'addresses' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'userId' },
          op: 'EQUAL',
          value: { stringValue: userId }
        }
      }
    }
  };
  const response = await firestoreApi.post(':runQuery', query);
  return response.data
    .filter(item => item.document)
    .map(item => mapFirestoreDoc(item.document));
};

const addAddress = async (addressData) => {
  const fields = Object.keys(addressData).reduce((acc, key) => {
    acc[key] = { stringValue: String(addressData[key]) };
    return acc;
  }, {});
  const response = await firestoreApi.post(ENDPOINTS.FIRESTORE.ADDRESSES, { fields });
  return mapFirestoreDoc(response.data);
};

const updateAddress = async (addressId, addressData) => {
  const fields = Object.keys(addressData).reduce((acc, key) => {
    acc[key] = { stringValue: String(addressData[key]) };
    return acc;
  }, {});
  const response = await firestoreApi.patch(`${ENDPOINTS.FIRESTORE.ADDRESSES}/${addressId}`, { fields });
  return mapFirestoreDoc(response.data);
};

export { getAddresses, addAddress, updateAddress };
