// client/src/App.jsx

/* eslint-disable no-unused-vars */
import { Route, Routes } from "react-router-dom";
import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import AdminLayout from "./components/admin-view/layout";
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminProducts from "./pages/admin-view/products";
import AdminOrders from "./pages/admin-view/orders";
import AdminFeatures from "./pages/admin-view/features";
import AdminDeliveryLocations from "./pages/admin-view/delivery-locations";
import ShoppingLayout from "./components/shopping-view/layout";
import NotFound from "./pages/not-found";
import ShoppingHome from "./pages/shopping-view/home";
import ShoppingListing from "./pages/shopping-view/listing";
import ShoppingCheckout from "./pages/shopping-view/checkout";
import ShoppingAccount from "./pages/shopping-view/account";
import CheckAuth from "./components/common/check-auth";
import UnauthPage from "./pages/unauth-page";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  checkAuth,
  setFirebaseUser,
  clearAuth,
  syncFirebaseAuth,
  setLoading,
} from "./store/auth-slice";
import PaypalReturnPage from "./pages/shopping-view/paypal-return";
import PaymentSuccessPage from "./pages/shopping-view/payment-success";
import SearchProducts from "./pages/shopping-view/search";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import SpectacularLoader from "./components/common/spectacular-loader";

function App() {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadingTimeout = setTimeout(() => {
      if (!initialLoadComplete && mounted) {
        setFirebaseInitialized(true);
        setInitialLoadComplete(true);
        dispatch(setLoading(false));
      }
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;
      try {
        if (firebaseUser) {
          dispatch(setFirebaseUser({ uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName }));
          await dispatch(syncFirebaseAuth(firebaseUser));
        } else {
          dispatch(setFirebaseUser(null));
          await dispatch(checkAuth());
        }
      } catch (error) {
        console.error("Auth verification error:", error);
        if (mounted) dispatch(clearAuth());
      } finally {
        if (mounted) {
          setFirebaseInitialized(true);
          setInitialLoadComplete(true);
          clearTimeout(loadingTimeout);
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, [dispatch]);

  if (!initialLoadComplete) return <SpectacularLoader />;

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Routes>
        <Route path="/" element={<CheckAuth isAuthenticated={isAuthenticated} user={user} />} />

        {/* Auth */}
        <Route path="/auth" element={<CheckAuth isAuthenticated={isAuthenticated} user={user}><AuthLayout /></CheckAuth>}>
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<CheckAuth isAuthenticated={isAuthenticated} user={user}><AdminLayout /></CheckAuth>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="features" element={<AdminFeatures />} />
          <Route path="delivery-locations" element={<AdminDeliveryLocations />} />
        </Route>

        {/* Shop */}
        <Route path="/shop" element={<CheckAuth isAuthenticated={isAuthenticated} user={user}><ShoppingLayout /></CheckAuth>}>
          <Route path="home" element={<ShoppingHome />} />
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="checkout" element={<ShoppingCheckout />} />
          <Route path="account" element={<ShoppingAccount />} />
          {/* Legacy routes — kept but not surfaced in UI */}
          <Route path="paypal-return" element={<PaypalReturnPage />} />
          <Route path="payment-success" element={<PaymentSuccessPage />} />
          <Route path="search" element={<SearchProducts />} />
        </Route>

        <Route path="/unauth-page" element={<UnauthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;