/* eslint-disable no-unused-vars */
// client/src/store/shop/address-slice/index.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";

const initialState = {
  isLoading: false,
  addressList: [],
  error: null,
};

export const addNewAddress = createAsyncThunk(
  "address/addNewAddress",
  async (formData, { rejectWithValue }) => {
    try {
      console.log('📍 Adding new address:', formData);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/shop/address/add`,
        formData
      );

      console.log('✅ Address added:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error adding address:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchAllAddresses = createAsyncThunk(
  "address/fetchAllAddresses",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/shop/address/get/${userId}`
      );

      return response.data;
    } catch (error) {
      console.error('❌ Error fetching addresses:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const editAddress = createAsyncThunk(
  "address/editAddress",
  async ({ userId, addressId, formData }, { rejectWithValue }) => {
    try {
      console.log('✏️ Editing address:', { userId, addressId, formData });
      
      const response = await axios.put(
        `${API_BASE_URL}/api/shop/address/update/${userId}/${addressId}`,
        formData
      );

      console.log('✅ Address updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error editing address:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "address/deleteAddress",
  async ({ userId, addressId }, { rejectWithValue }) => {
    try {
      console.log('🗑️ Deleting address:', { userId, addressId });
      
      const response = await axios.delete(
        `${API_BASE_URL}/api/shop/address/delete/${userId}/${addressId}`
      );

      console.log('✅ Address deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting address:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Address
      .addCase(addNewAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addNewAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(addNewAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to add address";
      })
      
      // Fetch Addresses
      .addCase(fetchAllAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addressList = action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchAllAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.addressList = [];
        state.error = action.payload?.message || "Failed to fetch addresses";
      })
      
      // Edit Address
      .addCase(editAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(editAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to edit address";
      })
      
      // Delete Address
      .addCase(deleteAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to delete address";
      });
  },
});

export const { clearError } = addressSlice.actions;
export default addressSlice.reducer;