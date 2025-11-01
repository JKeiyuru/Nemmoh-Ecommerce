/* eslint-disable react/prop-types */
// client/src/components/common/check-auth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function CheckAuth({ children }) {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);
  
  console.log('CheckAuth Debug:', {
    isAuthenticated,
    user,
    isLoading,
    pathname: location.pathname,
    userRole: user?.role
  });

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isAuthPage = location.pathname.startsWith("/auth");
  const isAdminPage = location.pathname.startsWith("/admin");
  const isShopPage = location.pathname.startsWith("/shop");
  
  // Protected routes that require authentication
  const protectedShopRoutes = ['/shop/checkout', '/shop/account'];
  const isProtectedShopRoute = protectedShopRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  // Root path redirect
  if (location.pathname === "/") {
    if (!isAuthenticated) {
      return <Navigate to="/shop/home" replace />;
    }
    return <Navigate to={
      user?.role === "admin" ? "/admin/dashboard" : "/shop/home"
    } replace />;
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthPage) {
    return <Navigate to={
      user?.role === "admin" ? "/admin/dashboard" : "/shop/home"
    } replace />;
  }

  // Protect admin routes
  if (isAuthenticated && user?.role !== "admin" && isAdminPage) {
    return <Navigate to="/unauth-page" replace />;
  }

  // Redirect admin from shop to dashboard
  if (isAuthenticated && user?.role === "admin" && isShopPage) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Only protect specific shop routes (checkout, account)
  if (!isAuthenticated && isProtectedShopRoute) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Protect all admin routes when not authenticated
  if (!isAuthenticated && isAdminPage) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default CheckAuth;