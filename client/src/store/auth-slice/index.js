// client/src/store/auth-slice/index.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { API_BASE_URL } from "@/config/config.js";

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  firebaseUser: null,
  authChecked: false,
};

// Register with Firebase + Backend
export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ formData, firebaseUid }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        { ...formData, firebaseUid },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Complete registration on the backend for a Firebase account that was just
// created client-side (createUserWithEmailAndPassword). Uses the Firebase ID
// token for auth, not a cookie — safe to call before any session exists.
export const registerFirebaseUser = createAsyncThunk(
  "auth/registerFirebaseUser",
  async ({ userName, email, firebaseUid, idToken }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/firebase-register`,
        { userName, email, firebaseUid },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Login with Firebase + Backend
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ formData, firebaseUid }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { ...formData, firebaseUid },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Enhanced Logout with immediate state clear
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      console.log('🚪 Starting logout process...');
      
      // Immediately clear auth state for instant UI update
      dispatch(clearAuth());
      
      // Sign out from Firebase
      try {
        await signOut(auth);
        console.log('✅ Firebase signout successful');
      } catch (firebaseError) {
        console.error('⚠️ Firebase signout error:', firebaseError);
      }
      
      // Clear backend session
      try {
        await axios.post(
          `${API_BASE_URL}/api/auth/logout`,
          {},
          { withCredentials: true }
        );
        console.log('✅ Backend logout successful');
      } catch (backendError) {
        console.error('⚠️ Backend logout error:', backendError);
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Verify auth status with Firebase token
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (firebaseToken, { rejectWithValue }) => {
    try {
      console.log('🔍 CheckAuth called with token:', firebaseToken ? 'Token provided' : 'No token');
      
      const headers = {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Content-Type": "application/json",
      };
      
      if (firebaseToken) {
        headers.Authorization = `Bearer ${firebaseToken}`;
        console.log('🔑 Added Authorization header with Firebase token');
      }

      console.log('📡 Making checkAuth request to backend...');
      const response = await axios.get(
        `${API_BASE_URL}/api/auth/check-auth`,
        {
          withCredentials: true,
          headers,
        }
      );
      
      console.log('✅ CheckAuth response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ CheckAuth error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue({ success: false, message: 'Not authenticated' });
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Sync Firebase auth with backend
export const syncFirebaseAuth = createAsyncThunk(
  "auth/syncFirebaseAuth",
  async (firebaseUser, { rejectWithValue, dispatch }) => {
    try {
      console.log('🔄 Syncing Firebase auth for user:', firebaseUser.email);
      
      const idToken = await firebaseUser.getIdToken(true);
      console.log('🎫 Got fresh Firebase token');
      
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/social-login`,
        {
          token: idToken,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          provider: 'google'
        },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          }
        }
      );
      
      console.log('✅ Backend sync successful:', response.data);
      
      const authResult = await dispatch(checkAuth(idToken));
      
      if (authResult.payload?.success) {
        return authResult.payload;
      } else {
        return response.data;
      }
      
    } catch (error) {
      console.error('❌ Firebase sync error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      console.log('👤 Setting user:', action.payload?.email || action.payload?.userName);
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.authChecked = true;
      state.isLoading = false;
    },
    setFirebaseUser: (state, action) => {
      console.log('🔥 Setting Firebase user:', action.payload?.email || 'null');
      state.firebaseUser = action.payload;
    },
    clearAuth: (state) => {
      console.log('🧹 Clearing auth state');
      state.isAuthenticated = false;
      state.user = null;
      state.firebaseUser = null;
      state.authChecked = true;
      state.isLoading = false;
    },
    setAuthChecked: (state, action) => {
      state.authChecked = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
      })

      // Register (Firebase)
      .addCase(registerFirebaseUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerFirebaseUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success && action.payload?.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
        state.authChecked = true;
      })
      .addCase(registerFirebaseUser.rejected, (state) => {
        state.isLoading = false;
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('🔓 LoginUser fulfilled:', action.payload?.success);
        state.isLoading = false;
        if (action.payload?.success && action.payload?.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          console.log('✅ User authenticated via login:', action.payload.user.role);
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
        state.authChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log('❌ LoginUser rejected:', action.payload);
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.authChecked = true;
      })
      
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        console.log('✅ CheckAuth fulfilled:', action.payload?.success);
        state.isLoading = false;
        
        if (action.payload?.success && action.payload?.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          console.log('🎯 User authenticated via checkAuth. Role:', action.payload.user.role);
        } else {
          state.user = null;
          state.isAuthenticated = false;
          console.log('🚫 User not authenticated via checkAuth');
        }
        state.authChecked = true;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        console.log('❌ CheckAuth rejected:', action.payload?.message);
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.authChecked = true;
      })
      
      // Sync Firebase Auth
      .addCase(syncFirebaseAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(syncFirebaseAuth.fulfilled, (state, action) => {
        console.log('🔄 Firebase sync fulfilled:', action.payload?.success);
        state.isLoading = false;
        
        if (action.payload?.success && action.payload?.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          console.log('✅ User authenticated via Firebase sync. Role:', action.payload.user.role);
        } else {
          console.log('⚠️ Firebase sync succeeded but no user data');
        }
        state.authChecked = true;
      })
      .addCase(syncFirebaseAuth.rejected, (state, action) => {
        console.log('❌ Firebase sync rejected:', action.payload);
        state.isLoading = false;
        state.authChecked = true;
      })
      
      // Logout - State already cleared by action
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = false; // Keep false for instant UI update
      })
      .addCase(logoutUser.fulfilled, (state) => {
        console.log('👋 Logout fulfilled');
        state.isAuthenticated = false;
        state.user = null;
        state.firebaseUser = null;
        state.isLoading = false;
        state.authChecked = true;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout fails, clear the state
        console.log('⚠️ Logout rejected but clearing state anyway');
        state.isAuthenticated = false;
        state.user = null;
        state.firebaseUser = null;
        state.isLoading = false;
        state.authChecked = true;
      });
  },
});

export const { setUser, setFirebaseUser, clearAuth, setAuthChecked, setLoading } = authSlice.actions;
export default authSlice.reducer;