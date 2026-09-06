import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "@/config/config.js";

const GUEST_CART_KEY = "kmts_guest_cart";

function loadGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistGuestCart(items) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    // localStorage unavailable (private browsing, etc.) — fail silently
  }
}

const initialState = {
  cartItems: [],
  isLoading: false,
  // Guest (not-logged-in) cart — persisted client-side only, merged into the
  // account cart once the shopper logs in. Shape mirrors the server cart's
  // populated items: { productId, image, title, price, salePrice, quantity }.
  guestItems: loadGuestCart(),
};

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, productId, quantity }) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/shop/cart/add`,
      {
        userId,
        productId,
        quantity,
      }
    );

    return response.data;
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId) => {
    const response = await axios.get(
      `${API_BASE_URL}/api/shop/cart/get/${userId}`
    );

    return response.data;
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId, productId }) => {
    const response = await axios.delete(
      `${API_BASE_URL}/api/shop/cart/${userId}/${productId}`
    );

    return response.data;
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId, productId, quantity }) => {
    const response = await axios.put(
      `${API_BASE_URL}/api/shop/cart/update-cart`,
      {
        userId,
        productId,
        quantity,
      }
    );

    return response.data;
  }
);

// Called once, right after a guest with items in their local cart logs in.
// Pushes each guest item into their real (server-backed) cart, then clears
// the local guest cart and refreshes the authoritative cart from the server.
export const mergeGuestCartOnLogin = createAsyncThunk(
  "cart/mergeGuestCartOnLogin",
  async (userId, { getState, dispatch }) => {
    const { guestItems } = getState().shopCart;
    if (!userId || !guestItems || guestItems.length === 0) {
      return { merged: 0 };
    }

    for (const item of guestItems) {
      try {
        await axios.post(`${API_BASE_URL}/api/shop/cart/add`, {
          userId,
          productId: item.productId,
          quantity: item.quantity,
        });
      } catch {
        // Skip items that fail (e.g. product no longer exists) and continue
      }
    }

    dispatch(clearGuestCart());
    await dispatch(fetchCartItems(userId));
    return { merged: guestItems.length };
  }
);

const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {
    // Add or increment a product in the guest (localStorage) cart.
    addGuestItem: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const productId = product._id || product.productId;
      const existing = state.guestItems.find((i) => i.productId === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.guestItems.push({
          productId,
          image: product.image,
          title: product.title,
          price: product.price,
          salePrice: product.salePrice,
          quantity,
        });
      }
      persistGuestCart(state.guestItems);
    },
    updateGuestItemQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.guestItems.find((i) => i.productId === productId);
      if (item) item.quantity = quantity;
      state.guestItems = state.guestItems.filter((i) => i.quantity > 0);
      persistGuestCart(state.guestItems);
    },
    removeGuestItem: (state, action) => {
      state.guestItems = state.guestItems.filter((i) => i.productId !== action.payload.productId);
      persistGuestCart(state.guestItems);
    },
    clearGuestCart: (state) => {
      state.guestItems = [];
      persistGuestCart([]);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(addToCart.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(fetchCartItems.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(updateCartQuantity.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(deleteCartItem.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      });
  },
});

export const { addGuestItem, updateGuestItemQuantity, removeGuestItem, clearGuestCart } = shoppingCartSlice.actions;
export default shoppingCartSlice.reducer;
