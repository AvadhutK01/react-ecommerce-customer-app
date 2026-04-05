import { authApi, firestoreApi } from '../../api/axiosInstance';
import ENDPOINTS from '../../api/endpoints';

const registerUser = async (email, password, name) => {
  const response = await authApi.post(ENDPOINTS.AUTH.SIGN_UP, {
    email,
    password,
    returnSecureToken: true
  });

  const userInfo = await authApi.post(ENDPOINTS.AUTH.LOOKUP, {
    idToken: response.data.idToken
  });

  const userData = userInfo.data.users[0];

  const user = {
    email: response.data.email,
    uid: response.data.localId,
    name: name || response.data.email.split('@')[0],
    isVerified: userData.emailVerified || false
  };

  try {
    await firestoreApi.patch(`${ENDPOINTS.FIRESTORE.CUSTOMERS}/${user.uid}`, {
      fields: {
        name: { stringValue: user.name },
        email: { stringValue: user.email },
        phone: { stringValue: '' },
        totalOrders: { integerValue: 0 },
        totalSpent: { doubleValue: 0 },
        status: { stringValue: 'active' },
        createdAt: { stringValue: new Date().toISOString() }
      }
    }, {
      headers: {
        Authorization: `Bearer ${response.data.idToken}`
      }
    });
  } catch (firestoreError) {
    console.error('Firestore sync failed:', firestoreError);
  }

  localStorage.setItem('customer_user', JSON.stringify(user));
  localStorage.setItem('customer_token', response.data.idToken);

  return { user, token: response.data.idToken };
};

const loginUser = async (email, password) => {
  const response = await authApi.post(ENDPOINTS.AUTH.SIGN_IN, {
    email,
    password,
    returnSecureToken: true
  });

  const userInfo = await authApi.post(ENDPOINTS.AUTH.LOOKUP, {
    idToken: response.data.idToken
  });

  const userData = userInfo.data.users[0];

  const user = {
    email: response.data.email,
    uid: response.data.localId,
    name: response.data.displayName || response.data.email.split('@')[0],
    isVerified: userData.emailVerified || false
  };

  localStorage.setItem('customer_user', JSON.stringify(user));
  localStorage.setItem('customer_token', response.data.idToken);

  return { user, token: response.data.idToken };
};

const updateProfile = async (token, name, currentUser) => {
  const response = await authApi.post(ENDPOINTS.AUTH.UPDATE, {
    idToken: token,
    displayName: name,
    returnSecureToken: true
  });

  const updatedUser = {
    ...currentUser,
    name: response.data.displayName,
    isVerified: response.data.emailVerified
  };

  localStorage.setItem('customer_user', JSON.stringify(updatedUser));

  return updatedUser;
};

const sendVerificationEmail = async (token) => {
  await authApi.post(ENDPOINTS.AUTH.SEND_OOB_CODE, {
    idToken: token,
    requestType: 'VERIFY_EMAIL'
  });
};

const checkAuthStatus = async (token) => {
  const response = await authApi.post(ENDPOINTS.AUTH.LOOKUP, {
    idToken: token
  });

  const userData = response.data.users[0];
  const user = {
    email: userData.email,
    uid: userData.localId,
    name: userData.displayName || userData.email.split('@')[0],
    isVerified: userData.emailVerified
  };

  localStorage.setItem('customer_user', JSON.stringify(user));

  return user;
};

const forgotPassword = async (email) => {
  await authApi.post(ENDPOINTS.AUTH.SEND_OOB_CODE, {
    email,
    requestType: 'PASSWORD_RESET'
  });
};

export {
  registerUser,
  loginUser,
  updateProfile,
  sendVerificationEmail,
  checkAuthStatus,
  forgotPassword
};
