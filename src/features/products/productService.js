import { firestoreApi } from '../../api/axiosInstance';
import ENDPOINTS from '../../api/endpoints';

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;

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

const getCategories = async (pageSize = 100) => {
  const response = await firestoreApi.get(`${ENDPOINTS.FIRESTORE.CATEGORIES}?pageSize=${pageSize}`);
  return {
    items: response.data.documents?.map(mapFirestoreDoc) || [],
  };
};

const getCategoryById = async (categoryId) => {
  const response = await firestoreApi.get(`${ENDPOINTS.FIRESTORE.CATEGORIES}/${categoryId}`);
  return mapFirestoreDoc(response.data);
};

const getProductsByCategory = async (categoryId, limit = 10, offset = 0) => {
  const query = {
    structuredQuery: {
      from: [{ collectionId: 'products' }],
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
  const response = await firestoreApi.post(':runQuery', query);
  return response.data
    .filter(item => item.document)
    .map(item => mapFirestoreDoc(item.document));
};

const getProductById = async (productId) => {
  const response = await firestoreApi.get(`${ENDPOINTS.FIRESTORE.PRODUCTS}/${productId}`);
  return mapFirestoreDoc(response.data);
};

const searchProducts = async (nameRegex) => {
  const response = await firestoreApi.get(ENDPOINTS.FIRESTORE.PRODUCTS);
  const allProducts = response.data.documents?.map(mapFirestoreDoc) || [];
  const regex = new RegExp(nameRegex, 'i');
  return allProducts.filter(p => regex.test(p.name));
};

const updateProductStock = async (productId, incrementAmount) => {
  const payload = {
    writes: [
      {
        transform: {
          document: `projects/${PROJECT_ID}/databases/(default)/documents/products/${productId}`,
          fieldTransforms: [
            {
              fieldPath: 'stock',
              increment: { integerValue: Number(incrementAmount) }
            }
          ]
        }
      }
    ]
  };
  await firestoreApi.post(':commit', payload);
};

export { 
  getCategories, 
  getCategoryById, 
  getProductsByCategory, 
  getProductById, 
  searchProducts, 
  updateProductStock 
};
