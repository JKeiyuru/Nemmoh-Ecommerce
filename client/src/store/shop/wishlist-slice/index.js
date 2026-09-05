import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '@/config/config.js';

const BASE = `${API_BASE_URL}/api/wishlist`;

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (userId) => {
  const res = await axios.get(`${BASE}/${userId}`);
  return res.data;
});

export const addToWishlist = createAsyncThunk('wishlist/add', async ({ userId, productId }) => {
  const res = await axios.post(`${BASE}`, { userId, productId });
  return res.data.wishlist;
});

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async ({ userId, productId }) => {
  const res = await axios.post(`${BASE}/remove`, { userId, productId });
  return res.data.wishlist;
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    isLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.products || [];
      })
      .addCase(fetchWishlist.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.items = action.payload.products || [];
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = action.payload.products || [];
      });
  },
});

export default wishlistSlice.reducer;
