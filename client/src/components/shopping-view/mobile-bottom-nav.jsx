// client/src/components/shopping-view/mobile-bottom-nav.jsx
import { Home, Grid3x3, ShoppingCart, Heart, UserCircle2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Sheet } from "../ui/sheet";
import UserCartWrapper from "./cart-wrapper";
import WishlistSheet from "./wishlist-sheet";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";

// Fixed bottom tab bar shown only on mobile/small screens (hidden lg+).
// Keeps the four highest-intent actions one thumb-tap away: Home, Shop,
// Cart and Account — with Wishlist folded in as a badge on the heart icon.
function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const wishlistItems = useSelector((state) => state.shopWishlist.items || []);

  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [openWishlistSheet, setOpenWishlistSheet] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, isAuthenticated, user?.id]);

  const cartCount = cartItems?.items?.length || 0;
  const wishlistCount = isAuthenticated ? wishlistItems.length : 0;

  const isActive = (path) => location.pathname === path;

  const requireAuth = (action) => {
    if (!isAuthenticated) {
      toast({ title: "Please login to continue", description: "You'll be redirected to the login page." });
      setTimeout(() => navigate("/auth/login"), 1200);
      return;
    }
    action();
  };

  const tabs = [
    {
      key: "home",
      label: "Home",
      icon: Home,
      onClick: () => navigate("/shop/home"),
      active: isActive("/shop/home"),
    },
    {
      key: "shop",
      label: "Shop",
      icon: Grid3x3,
      onClick: () => navigate("/shop/listing"),
      active: isActive("/shop/listing"),
    },
    {
      key: "cart",
      label: "Cart",
      icon: ShoppingCart,
      onClick: () => requireAuth(() => setOpenCartSheet(true)),
      active: false,
      badge: cartCount,
    },
    {
      key: "wishlist",
      label: "Wishlist",
      icon: Heart,
      onClick: () => requireAuth(() => setOpenWishlistSheet(true)),
      active: false,
      badge: wishlistCount,
    },
    {
      key: "account",
      label: "Account",
      icon: UserCircle2,
      onClick: () => (isAuthenticated ? navigate("/shop/account") : navigate("/auth/login")),
      active: isActive("/shop/account"),
    },
  ];

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-5 h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={tab.onClick}
                className="relative flex flex-col items-center justify-center gap-0.5 active:bg-gray-50 transition-colors"
              >
                <span className="relative">
                  <Icon
                    className={`w-5 h-5 ${tab.active ? "text-amber-600" : "text-gray-500"}`}
                    strokeWidth={tab.active ? 2.4 : 2}
                  />
                  {!!tab.badge && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-amber-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                      {tab.badge > 9 ? "9+" : tab.badge}
                    </span>
                  )}
                </span>
                <span className={`text-[10px] font-medium ${tab.active ? "text-amber-600" : "text-gray-500"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Cart sheet, triggered from the bottom nav */}
      <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
        {isAuthenticated && (
          <UserCartWrapper
            setOpenCartSheet={setOpenCartSheet}
            cartItems={cartItems?.items?.length > 0 ? cartItems.items : []}
          />
        )}
      </Sheet>

      {/* Wishlist sheet, triggered from the bottom nav */}
      <Sheet open={openWishlistSheet} onOpenChange={setOpenWishlistSheet}>
        {isAuthenticated && <WishlistSheet setOpenWishlistSheet={setOpenWishlistSheet} />}
      </Sheet>
    </>
  );
}

export default MobileBottomNav;
