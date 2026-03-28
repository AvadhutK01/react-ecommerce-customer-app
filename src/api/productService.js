import axiosInstance from './axiosInstance';

const COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';

export const getCategories = async (pageSize = 100) => {
  const response = await axiosInstance.get(`/${CATEGORIES_COLLECTION}?pageSize=${pageSize}`);
  return {
    items: response.data.documents?.map(doc => ({
      id: doc.name.split('/').pop(),
      ...Object.keys(doc.fields).reduce((acc, key) => {
        acc[key] = doc.fields[key].stringValue || doc.fields[key].integerValue || doc.fields[key].doubleValue || doc.fields[key].booleanValue;
        return acc;
      }, {})
    })) || [],
  };
};

export const getCategoryById = async (categoryId) => {
  const response = await axiosInstance.get(`/${CATEGORIES_COLLECTION}/${categoryId}`);
  const doc = response.data;
  return {
    id: doc.name.split('/').pop(),
    ...Object.keys(doc.fields).reduce((acc, key) => {
      acc[key] = doc.fields[key].stringValue || doc.fields[key].integerValue || doc.fields[key].doubleValue || doc.fields[key].booleanValue;
      return acc;
    }, {})
  };
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
    .map(item => {
      const doc = item.document;
      return {
        id: doc.name.split('/').pop(),
        ...Object.keys(doc.fields).reduce((acc, key) => {
          acc[key] = doc.fields[key].stringValue || doc.fields[key].integerValue || doc.fields[key].doubleValue || doc.fields[key].booleanValue;
          return acc;
        }, {})
      };
    });
};

export const searchProducts = async (nameRegex) => {
  const response = await axiosInstance.get(`/${COLLECTION}`);
  const allProducts = response.data.documents?.map(doc => ({
    id: doc.name.split('/').pop(),
    ...Object.keys(doc.fields).reduce((acc, key) => {
      acc[key] = doc.fields[key].stringValue || doc.fields[key].integerValue || doc.fields[key].doubleValue || doc.fields[key].booleanValue;
      return acc;
    }, {})
  })) || [];

  const regex = new RegExp(nameRegex, 'i');
  return allProducts.filter(p => regex.test(p.name));
};
