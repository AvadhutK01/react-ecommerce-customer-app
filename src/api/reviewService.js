import axiosInstance from './axiosInstance';

const COLLECTION = 'reviews';

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
    acc[key] = field.stringValue || Number(field.doubleValue) || Number(field.integerValue) || field.booleanValue;
    return acc;
  }, {})
});

export const addReview = async (reviewData) => {
  const fields = mapToFirestoreFields(reviewData);
  const response = await axiosInstance.post(`/${COLLECTION}`, { fields });
  return mapFirestoreDoc(response.data);
};

export const getReviewsByProduct = async (productId) => {
  const query = {
    structuredQuery: {
      from: [{ collectionId: COLLECTION }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'productId' },
          op: 'EQUAL',
          value: { stringValue: productId }
        }
      }
    }
  };
  const response = await axiosInstance.post(':runQuery', query);
  return response.data
    .filter(item => item.document)
    .map(item => mapFirestoreDoc(item.document))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

export const getUserProductReview = async (userId, productId) => {
  const query = {
    structuredQuery: {
      from: [{ collectionId: COLLECTION }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            { fieldFilter: { field: { fieldPath: 'userId' }, op: 'EQUAL', value: { stringValue: userId } } },
            { fieldFilter: { field: { fieldPath: 'productId' }, op: 'EQUAL', value: { stringValue: productId } } }
          ]
        }
      }
    }
  };
  const response = await axiosInstance.post(':runQuery', query);
  const docs = response.data.filter(item => item.document);
  return docs.length > 0 ? mapFirestoreDoc(docs[0].document) : null;
};

export const updateReview = async (reviewId, reviewData) => {
  const fields = mapToFirestoreFields(reviewData);
  const updateMask = Object.keys(reviewData).map(key => `updateMask.fieldPaths=${key}`).join('&');
  const response = await axiosInstance.patch(`/${COLLECTION}/${reviewId}?${updateMask}`, { fields });
  return mapFirestoreDoc(response.data);
};
