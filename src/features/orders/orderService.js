import { firestoreApi } from '../../api/axiosInstance';
import ENDPOINTS from '../../api/endpoints';

const mapToFirestoreFields = (data) => {
  const fields = {};
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      fields[key] = { doubleValue: value };
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map(item => ({
            mapValue: {
              fields: mapToFirestoreFields(item)
            }
          }))
        }
      };
    } else if (typeof value === 'object' && value !== null) {
      fields[key] = {
        mapValue: {
          fields: mapToFirestoreFields(value)
        }
      };
    }
  });
  return fields;
};

const mapFirestoreDoc = (doc) => ({
  id: doc.name.split('/').pop(),
  ...Object.keys(doc.fields).reduce((acc, key) => {
    const field = doc.fields[key];
    if (field.stringValue) acc[key] = field.stringValue;
    else if (field.doubleValue) acc[key] = Number(field.doubleValue);
    else if (field.integerValue) acc[key] = Number(field.integerValue);
    else if (field.booleanValue) acc[key] = field.booleanValue;
    else if (field.mapValue) {
      acc[key] = Object.keys(field.mapValue.fields).reduce((mAcc, mKey) => {
        const mField = field.mapValue.fields[mKey];
        mAcc[mKey] = mField.stringValue || Number(mField.doubleValue) || Number(mField.integerValue) || mField.booleanValue;
        return mAcc;
      }, {});
    } else if (field.arrayValue) {
      acc[key] = field.arrayValue.values?.map(val => {
        return Object.keys(val.mapValue.fields).reduce((mAcc, mKey) => {
          const mField = val.mapValue.fields[mKey];
          mAcc[mKey] = mField.stringValue || Number(mField.doubleValue) || Number(mField.integerValue) || mField.booleanValue;
          return mAcc;
        }, {});
      }) || [];
    }
    return acc;
  }, {})
});

const createOrder = async (orderData) => {
  const fields = mapToFirestoreFields(orderData);
  const response = await firestoreApi.post(ENDPOINTS.FIRESTORE.ORDERS, { fields });
  return response.data;
};

const getUserOrders = async (userId) => {
  const query = {
    structuredQuery: {
      from: [{ collectionId: 'orders' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'userId' },
          op: 'EQUAL',
          value: { stringValue: userId }
        }
      },
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }]
    }
  };
  const response = await firestoreApi.post(':runQuery', query);
  return response.data
    .filter(item => item.document)
    .map(item => mapFirestoreDoc(item.document));
};

const getOrderById = async (orderId) => {
  const response = await firestoreApi.get(`${ENDPOINTS.FIRESTORE.ORDERS}/${orderId}`);
  return mapFirestoreDoc(response.data);
};

const updateOrder = async (orderId, data) => {
  const fields = mapToFirestoreFields(data);
  const updateMask = Object.keys(data).map(key => `updateMask.fieldPaths=${key}`).join('&');
  const response = await firestoreApi.patch(`${ENDPOINTS.FIRESTORE.ORDERS}/${orderId}?${updateMask}`, { fields });
  return mapFirestoreDoc(response.data);
};

export { createOrder, getUserOrders, getOrderById, updateOrder };
