// client/src/components/shopping-view/layout.jsx
import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";
import MobileBottomNav from "./mobile-bottom-nav";

function ShoppingLayout() {
  return (
    <div className="flex flex-col bg-gradient-to-b from-white via-gray-50/30 to-white overflow-hidden min-h-screen">
      {/* Fixed header */}
      <ShoppingHeader />

      {/* Main content with top padding to account for fixed header,
          and bottom padding on mobile to clear the fixed bottom nav */}
      <main className="flex flex-col w-full pt-[64px] md:pt-[80px] lg:pt-[120px] pb-20 lg:pb-0">
        <Outlet />
      </main>

      {/* Fixed bottom tab bar — mobile only */}
      <MobileBottomNav />
    </div>
  );
}

export default ShoppingLayout;