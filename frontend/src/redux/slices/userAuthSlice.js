import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAuthService } from '../../services/userAuthService';

// Thunk para cargar operador actual
export const loadUserData = createAsyncThunk(
  'userAuth/loadUserData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAuthService.getCurrentUser();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar usuario');
    }
  }
);

const token = localStorage.getItem('userToken');

const initialState = {
  user: null,
  token: token,
  isAuthenticated: !!token,
  loading: !!token,
  error: null,
};

const userAuthSlice = createSlice({
  name: 'userAuth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      localStorage.setItem('userToken', action.payload.token);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
      localStorage.removeItem('userToken');
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('userToken');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loadUserData.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
        localStorage.removeItem('userToken');
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = userAuthSlice.actions;

export default userAuthSlice.reducer;