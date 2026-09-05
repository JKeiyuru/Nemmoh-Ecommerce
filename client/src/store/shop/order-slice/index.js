// client/src/store/shop/order-slice/index.js

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";

const BASE = `${API_BASE_URL}/api/shop/order`;

const initialState = {
  isLoading: false,
  orderId: null,
  orderList: [],
  orderDetails: null,
  paystack: null, // { orderId, reference, authorizationUrl, accessCode, publicKey }
};

// ─── Cash on Delivery ─────────────────────────────────────────────────────────
export const createOrder = createAsyncThunk(
  "/order/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE}/create`, orderData);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: e.message });
    }
  }
);

// ─── Paystack ─────────────────────────────────────────────────────────────────
export const initiatePaystackPayment = createAsyncThunk(
  "/order/initiatePaystackPayment",
  async (orderData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE}/paystack/initiate`, orderData);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: e.message });
    }
  }
);

export const verifyPaystackPayment = createAsyncThunk(
  "/order/verifyPaystackPayment",
  async (reference, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE}/paystack/verify`, { reference });
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: e.message });
    }
  }
);

// ─── User order list ──────────────────────────────────────────────────────────
export const getAllOrdersByUserId = createAsyncThunk(
  "/order/getAllOrdersByUserId",
  async (userId) => {
    const res = await axios.get(`${BASE}/list/${userId}`);
    return res.data;
  }
);

export const getOrderDetails = createAsyncThunk(
  "/order/getOrderDetails",
  async (id) => {
    const res = await axios.get(`${BASE}/details/${id}`);
    return res.data;
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const shoppingOrderSlice = createSlice({
  name: "shoppingOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => { state.orderDetails = null; },
    resetPaystack: (state) => { state.paystack = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending,    (state) => { state.isLoading = true; })
      .addCase(createOrder.fulfilled,  (state, action) => {
        state.isLoading = false;
        state.orderId = action.payload.orderId;
      })
      .addCase(createOrder.rejected,   (state) => { state.isLoading = false; state.orderId = null; })

      .addCase(initiatePaystackPayment.pending,   (state) => { state.isLoading = true; })
      .addCase(initiatePaystackPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paystack = action.payload;
      })
      .addCase(initiatePaystackPayment.rejected,  (state) => { state.isLoading = false; })

      .addCase(verifyPaystackPayment.pending,   (state) => { state.isLoading = true; })
      .addCase(verifyPaystackPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderId = action.payload.orderId;
      })
      .addCase(verifyPaystackPayment.rejected,  (state) => { state.isLoading = false; })

      .addCase(getAllOrdersByUserId.pending,   (state) => { state.isLoading = true; })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => { state.isLoading = false; state.orderList = action.payload.data || []; })
      .addCase(getAllOrdersByUserId.rejected,  (state) => { state.isLoading = false; state.orderList = []; })

      .addCase(getOrderDetails.pending,   (state) => { state.isLoading = true; })
      .addCase(getOrderDetails.fulfilled, (state, action) => { state.isLoading = false; state.orderDetails = action.payload.data; })
      .addCase(getOrderDetails.rejected,  (state) => { state.isLoading = false; state.orderDetails = null; });
  },
});

export const { resetOrderDetails, resetPaystack } = shoppingOrderSlice.actions;
export default shoppingOrderSlice.reducer;
