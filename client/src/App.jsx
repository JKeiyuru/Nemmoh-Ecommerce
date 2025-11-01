/* eslint-disable no-unused-vars */
// client/src/App.jsx
import { Route, Routes } from "react-router-dom";
import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import AdminLayout from "./components/admin-view/layout";
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminProducts from "./pages/admin-view/products";
import AdminOrders from "./pages/admin-view/orders";
import AdminFeatures from "./pages/admin-view/features";
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
import { checkAuth, setFirebaseUser, clearAuth, syncFirebaseAuth, setLoading } from "./store/auth-slice";
import PaypalReturnPage from "./pages/shopping-view/paypal-return";
import PaymentSuccessPage from "./pages/shopping-view/payment-success";
import SearchProducts from "./pages/shopping-view/search";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import SpectacularLoader from "./components/common/spectacular-loader";

function App() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    let mounted = true;

    console.log('🚀 App: Setting up Firebase auth listener...');

    // Set a timeout to prevent indefinite loading
    const loadingTimeout = setTimeout(() => {
      if (!initialLoadComplete && mounted) {
        console.log('⏱️ Loading timeout reached, proceeding without auth');
        setFirebaseInitialized(true);
        setInitialLoadComplete(true);
        dispatch(setLoading(false));
      }
    }, 3000); // 3 second timeout

    // Firebase Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;

      try {
        if (firebaseUser) {
          console.log('🔥 Firebase user detected:', firebaseUser.email);
          
          // Update Firebase user in Redux immediately
          dispatch(setFirebaseUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName
          }));

          // Sync Firebase auth with backend
          console.log('🔄 Syncing Firebase user with backend...');
          const syncResult = await dispatch(syncFirebaseAuth(firebaseUser));
          
          console.log('🔄 Firebase sync result:', syncResult.payload?.success);
          
        } else {
          console.log('🚫 No Firebase user detected');
          
          // Clear Firebase user from Redux
          dispatch(setFirebaseUser(null));
          
          // Check for traditional auth (JWT cookie) as fallback
          console.log('🔍 Checking for traditional auth...');
          await dispatch(checkAuth());
        }
      } catch (error) {
        console.error('❌ Auth verification error:', error);
        if (mounted) {
          dispatch(clearAuth());
        }
      } finally {
        if (mounted) {
          setFirebaseInitialized(true);
          setInitialLoadComplete(true);
          clearTimeout(loadingTimeout);
        }
      }
    });

    // Cleanup function
    return () => {
      console.log('🧹 App: Cleaning up Firebase auth listener...');
      mounted = false;
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, [dispatch]);

  // Only show loading on initial load, not on subsequent auth checks
  if (!initialLoadComplete) {
    console.log('⏳ App: Initial loading...', { firebaseInitialized, isLoading });
    return <SpectacularLoader />;
  }

  console.log('🎯 App render - Auth State:', { 
    isLoading, 
    isAuthenticated, 
    userRole: user?.role,
    userEmail: user?.email || user?.userName,
    firebaseInitialized 
  });

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Routes>
        <Route
          path="/"
          element={
            <CheckAuth
              isAuthenticated={isAuthenticated}
              user={user}
            ></CheckAuth>
          }
        />
        <Route
          path="/auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
        </Route>
        <Route
          path="/admin"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AdminLayout />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="features" element={<AdminFeatures />} />
        </Route>
        <Route
          path="/shop"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ShoppingLayout />
            </CheckAuth>
          }
        >
          <Route path="home" element={<ShoppingHome />} />
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="checkout" element={<ShoppingCheckout />} />
          <Route path="account" element={<ShoppingAccount />} />
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