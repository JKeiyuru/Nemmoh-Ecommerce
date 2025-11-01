// client/src/components/shopping-view/layout.jsx
import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";

function ShoppingLayout() {
  return (
    <div className="flex flex-col bg-white overflow-hidden min-h-screen">
      {/* Fixed header */}
      <ShoppingHeader />
      
      {/* Main content with top padding to account for fixed header */}
      <main className="flex flex-col w-full pt-[140px] lg:pt-[120px]">
        <Outlet />
      </main>
    </div>
  );
}

export default ShoppingLayout;