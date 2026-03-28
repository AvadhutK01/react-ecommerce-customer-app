import axiosInstance from './axiosInstance';

const COLLECTION = 'orders';

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

export const createOrder = async (orderData) => {
  const fields = mapToFirestoreFields(orderData);
  const response = await axiosInstance.post(`/${COLLECTION}`, { fields });
  return response.data;
};
