import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import userAuthReducer from '../slices/userAuthSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,        // Para admins
    userAuth: userAuthReducer, // Para operadores
  },
});

export default store;