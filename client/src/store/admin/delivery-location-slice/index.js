// client/src/store/admin/delivery-location-slice/index.js

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";

const BASE = `${API_BASE_URL}/api/admin/delivery-locations`;

const initialState = {
  locationList: [],   // full county list (admin view)
  publicList: [],     // active counties (storefront view)
  isLoading: false,
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchAllLocationsAdmin = createAsyncThunk(
  "deliveryLocations/fetchAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE}/`);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: e.message });
    }
  }
);

export const fetchPublicLocations = createAsyncThunk(
  "deliveryLocations/fetchPublic",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE}/public`);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: e.message });
    }
  }
);

export const seedLocations = createAsyncThunk(
  "deliveryLocations/seed",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE}/seed`);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: e.message });
    }
  }
);

// County CRUD
export const addCounty = createAsyncThunk("deliveryLocations/addCounty", async (county, { rejectWithValue }) => {
  try { const res = await axios.post(`${BASE}/county`, { county }); return res.data; }
  catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

export const updateCounty = createAsyncThunk("deliveryLocations/updateCounty", async ({ id, data }, { rejectWithValue }) => {
  try { const res = await axios.put(`${BASE}/county/${id}`, data); return res.data; }
  catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

export const deleteCounty = createAsyncThunk("deliveryLocations/deleteCounty", async (id, { rejectWithValue }) => {
  try { const res = await axios.delete(`${BASE}/county/${id}`); return res.data; }
  catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

// Sub-county CRUD
export const addSubCounty = createAsyncThunk("deliveryLocations/addSubCounty", async ({ countyId, name }, { rejectWithValue }) => {
  try { const res = await axios.post(`${BASE}/county/${countyId}/subcounty`, { name }); return res.data; }
  catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

export const updateSubCounty = createAsyncThunk("deliveryLocations/updateSubCounty", async ({ countyId, subCountyId, name }, { rejectWithValue }) => {
  try { const res = await axios.put(`${BASE}/county/${countyId}/subcounty/${subCountyId}`, { name }); return res.data; }
  catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

export const deleteSubCounty = createAsyncThunk("deliveryLocations/deleteSubCounty", async ({ countyId, subCountyId }, { rejectWithValue }) => {
  try { const res = await axios.delete(`${BASE}/county/${countyId}/subcounty/${subCountyId}`); return res.data; }
  catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

// Location CRUD
export const addLocation = createAsyncThunk("deliveryLocations/addLocation", async ({ countyId, subCountyId, name, deliveryFee }, { rejectWithValue }) => {
  try { const res = await axios.post(`${BASE}/county/${countyId}/subcounty/${subCountyId}/location`, { name, deliveryFee }); return res.data; }
  catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

export const updateLocation = createAsyncThunk("deliveryLocations/updateLocation", async ({ countyId, subCountyId, locationId, name, deliveryFee }, { rejectWithValue }) => {
  try { const res = await axios.put(`${BASE}/county/${countyId}/subcounty/${subCountyId}/location/${locationId}`, { name, deliveryFee }); return res.data; }
  catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

export const deleteLocation = createAsyncThunk("deliveryLocations/deleteLocation", async ({ countyId, subCountyId, locationId }, { rejectWithValue }) => {
  try { const res = await axios.delete(`${BASE}/county/${countyId}/subcounty/${subCountyId}/location/${locationId}`); return res.data; }
  catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const deliveryLocationSlice = createSlice({
  name: "deliveryLocations",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const handle = (thunk, targetKey) => {
      builder
        .addCase(thunk.pending, (state) => { state.isLoading = true; state.error = null; })
        .addCase(thunk.fulfilled, (state, action) => {
          state.isLoading = false;
          if (action.payload.data) {
            if (Array.isArray(action.payload.data)) {
              state[targetKey] = action.payload.data;
            } else {
              // Single doc returned after mutation — update in list
              const idx = state.locationList.findIndex(l => l._id === action.payload.data._id);
              if (idx !== -1) state.locationList[idx] = action.payload.data;
              else state.locationList.push(action.payload.data);
            }
          }
        })
        .addCase(thunk.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload?.message || "An error occurred";
        });
    };

    handle(fetchAllLocationsAdmin, "locationList");
    handle(fetchPublicLocations, "publicList");

    // Mutations — all return the updated county doc or trigger re-fetch in components
    [addCounty, updateCounty, addSubCounty, updateSubCounty, deleteSubCounty, addLocation, updateLocation, deleteLocation].forEach(thunk => handle(thunk, "locationList"));

    // Delete county — remove from list
    builder
      .addCase(deleteCounty.pending, (state) => { state.isLoading = true; })
      .addCase(deleteCounty.fulfilled, (state, action) => {
        state.isLoading = false;
        // Component will refetch after delete
      })
      .addCase(deleteCounty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to delete";
      });

    builder
      .addCase(seedLocations.pending, (state) => { state.isLoading = true; })
      .addCase(seedLocations.fulfilled, (state) => { state.isLoading = false; })
      .addCase(seedLocations.rejected, (state, action) => { state.isLoading = false; state.error = action.payload?.message; });
  },
});

export const { clearError } = deliveryLocationSlice.actions;
export default deliveryLocationSlice.reducer;