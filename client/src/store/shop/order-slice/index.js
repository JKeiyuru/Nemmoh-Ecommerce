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
  // Legacy — kept but not used in the new COD UI
  approvalURL: null,
};

// ─── COD Order ────────────────────────────────────────────────────────────────
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

// Legacy alias — points to same endpoint
export const createManualPaymentOrder = createOrder;

// ─── PayPal (legacy — kept in codebase, not surfaced in UI) ──────────────────
export const capturePayment = createAsyncThunk(
  "/order/capturePayment",
  async ({ paymentId, payerId, orderId }) => {
    const res = await axios.post(`${BASE}/capture`, { paymentId, payerId, orderId });
    return res.data;
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending,    (state) => { state.isLoading = true; })
      .addCase(createOrder.fulfilled,  (state, action) => {
        state.isLoading = false;
        state.orderId = action.payload.orderId;
      })
      .addCase(createOrder.rejected,   (state) => { state.isLoading = false; state.orderId = null; })

      .addCase(getAllOrdersByUserId.pending,   (state) => { state.isLoading = true; })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => { state.isLoading = false; state.orderList = action.payload.data || []; })
      .addCase(getAllOrdersByUserId.rejected,  (state) => { state.isLoading = false; state.orderList = []; })

      .addCase(getOrderDetails.pending,   (state) => { state.isLoading = true; })
      .addCase(getOrderDetails.fulfilled, (state, action) => { state.isLoading = false; state.orderDetails = action.payload.data; })
      .addCase(getOrderDetails.rejected,  (state) => { state.isLoading = false; state.orderDetails = null; });
  },
});

export const { resetOrderDetails } = shoppingOrderSlice.actions;
export default shoppingOrderSlice.reducer;