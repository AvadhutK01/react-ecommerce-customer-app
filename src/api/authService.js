import axios from 'axios';

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const AUTH_URL = 'https://identitytoolkit.googleapis.com/v1/accounts:';

export const registerUser = async (email, password, name) => {
  const response = await axios.post(`${AUTH_URL}signUp?key=${API_KEY}`, {
    email,
    password,
    returnSecureToken: true
  });
  
  if (name) {
    await axios.post(`${AUTH_URL}update?key=${API_KEY}`, {
      idToken: response.data.idToken,
      displayName: name,
      returnSecureToken: true
    });
  }
  
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await axios.post(`${AUTH_URL}signInWithPassword?key=${API_KEY}`, {
    email,
    password,
    returnSecureToken: true
  });
  return response.data;
};

export const getProfile = async (idToken) => {
  const response = await axios.post(`${AUTH_URL}lookup?key=${API_KEY}`, {
    idToken
  });
  return response.data.users[0];
};
