// client/src/components/admin-view/sidebar.jsx

import {
  BadgeCheck,
  ChartNoAxesCombined,
  LayoutDashboard,
  ShoppingBasket,
  Truck,
} from "lucide-react";
import { Fragment } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

const adminSidebarMenuItems = [
  { id: "dashboard",  label: "Dashboard",            path: "/admin/dashboard",           icon: <LayoutDashboard /> },
  { id: "products",   label: "Products",             path: "/admin/products",            icon: <ShoppingBasket /> },
  { id: "orders",     label: "Orders",               path: "/admin/orders",              icon: <BadgeCheck /> },
  { id: "delivery",   label: "Delivery Locations",   path: "/admin/delivery-locations",  icon: <Truck /> },
];

function MenuItems({ setOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="mt-8 flex-col flex gap-2">
      {adminSidebarMenuItems.map((menuItem) => {
        const isActive = location.pathname === menuItem.path;
        return (
          <div
            key={menuItem.id}
            onClick={() => { navigate(menuItem.path); setOpen?.(false); }}
            className={`flex cursor-pointer text-xl items-center gap-2 rounded-md px-3 py-2 transition-colors
              ${isActive
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            {menuItem.icon}
            <span className="text-base">{menuItem.label}</span>
          </div>
        );
      })}
    </nav>
  );
}

function AdminSideBar({ open, setOpen }) {
  const navigate = useNavigate();

  return (
    <Fragment>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle className="flex gap-2 mt-5 mb-5">
                <ChartNoAxesCombined size={30} />
                <h1 className="text-2xl font-extrabold">Admin Panel</h1>
              </SheetTitle>
            </SheetHeader>
            <MenuItems setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>
      <aside className="hidden w-64 flex-col border-r bg-background p-6 lg:flex">
        <div onClick={() => navigate("/admin/dashboard")} className="flex cursor-pointer items-center gap-2 mb-2">
          <ChartNoAxesCombined size={30} />
          <h1 className="text-2xl font-extrabold">Admin Panel</h1>
        </div>
        <MenuItems />
      </aside>
    </Fragment>
  );
}

export default AdminSideBar;