const ENDPOINTS = {
  AUTH: {
    SIGN_UP: ':signUp',
    SIGN_IN: ':signInWithPassword',
    UPDATE: ':update',
    SEND_OOB_CODE: ':sendOobCode',
    LOOKUP: ':lookup'
  },
  FIRESTORE: {
    PRODUCTS: '/products',
    CATEGORIES: '/categories',
    ORDERS: '/orders',
    ADDRESSES: '/addresses',
    REVIEWS: '/reviews',
    CUSTOMERS: '/customers'
  }
};

export default ENDPOINTS;
