import axiosInstance from './axiosInstance';

const COLLECTION = 'addresses';

const mapFirestoreDoc = (doc) => ({
  id: doc.name.split('/').pop(),
  ...Object.keys(doc.fields).reduce((acc, key) => {
    const field = doc.fields[key];
    acc[key] = field.stringValue || field.integerValue || field.doubleValue || field.booleanValue;
    return acc;
  }, {})
});

export const getAddresses = async (userId) => {
  const query = {
    structuredQuery: {
      from: [{ collectionId: COLLECTION }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'userId' },
          op: 'EQUAL',
          value: { stringValue: userId }
        }
      }
    }
  };
  const response = await axiosInstance.post(':runQuery', query);
  return response.data
    .filter(item => item.document)
    .map(item => mapFirestoreDoc(item.document));
};

export const addAddress = async (addressData) => {
  const fields = Object.keys(addressData).reduce((acc, key) => {
    acc[key] = { stringValue: String(addressData[key]) };
    return acc;
  }, {});

  const response = await axiosInstance.post(`/${COLLECTION}`, { fields });
  return mapFirestoreDoc(response.data);
};

export const updateAddress = async (addressId, addressData) => {
  const fields = Object.keys(addressData).reduce((acc, key) => {
    acc[key] = { stringValue: String(addressData[key]) };
    return acc;
  }, {});

  const response = await axiosInstance.patch(`/${COLLECTION}/${addressId}`, { fields });
  return mapFirestoreDoc(response.data);
};
