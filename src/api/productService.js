import axiosInstance from './axiosInstance';

const COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';

const mapFirestoreDoc = (doc) => ({
  id: doc.name.split('/').pop(),
  ...Object.keys(doc.fields).reduce((acc, key) => {
    const field = doc.fields[key];
    if (field.arrayValue) {
      acc[key] = field.arrayValue.values?.map(v => v.stringValue || v.integerValue || v.doubleValue) || [];
    } else {
      acc[key] = field.stringValue || field.integerValue || field.doubleValue || field.booleanValue;
    }
    return acc;
  }, {})
});

export const getCategories = async (pageSize = 100) => {
  const response = await axiosInstance.get(`/${CATEGORIES_COLLECTION}?pageSize=${pageSize}`);
  return {
    items: response.data.documents?.map(mapFirestoreDoc) || [],
  };
};

export const getCategoryById = async (categoryId) => {
  const response = await axiosInstance.get(`/${CATEGORIES_COLLECTION}/${categoryId}`);
  return mapFirestoreDoc(response.data);
};

export const getProductsByCategory = async (categoryId, limit = 10, offset = 0) => {
  const query = {
    structuredQuery: {
      from: [{ collectionId: COLLECTION }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'categoryId' },
          op: 'EQUAL',
          value: { stringValue: categoryId }
        }
      },
      limit: limit,
      offset: offset,
    }
  };
  const response = await axiosInstance.post(':runQuery', query);
  return response.data
    .filter(item => item.document)
    .map(item => mapFirestoreDoc(item.document));
};

export const getProductById = async (productId) => {
  const response = await axiosInstance.get(`/${COLLECTION}/${productId}`);
  return mapFirestoreDoc(response.data);
};

export const searchProducts = async (nameRegex) => {
  const response = await axiosInstance.get(`/${COLLECTION}`);
  const allProducts = response.data.documents?.map(mapFirestoreDoc) || [];

  const regex = new RegExp(nameRegex, 'i');
  return allProducts.filter(p => regex.test(p.name));
};
