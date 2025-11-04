/* eslint-disable no-unused-vars */
// client/src/components/shopping-view/header.jsx
import { HousePlug, LogOut, Menu, ShoppingCart, UserCog, Heart, HeartOff, Phone, MapPin, Clock, Truck, X } from "lucide-react";
import logo from "../../assets/Tempara1.5.jpg";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { useEffect, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";
import WishlistSheet from "./wishlist-sheet";
import { useToast } from "../ui/use-toast";

function MenuItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  function handleNavigate(getCurrentMenuItem) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      getCurrentMenuItem.id !== "home" &&
      getCurrentMenuItem.id !== "products" &&
      getCurrentMenuItem.id !== "search"
        ? {
            category: [getCurrentMenuItem.id],
          }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    location.pathname.includes("listing") && currentFilter !== null
      ? setSearchParams(
          new URLSearchParams(`?category=${getCurrentMenuItem.id}`)
        )
      : navigate(getCurrentMenuItem.path);
  }

  return (
    <nav className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2">
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <button
          key={menuItem.id}
          onClick={() => handleNavigate(menuItem)}
          className="text-sm font-light text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-300 text-left lg:text-center elegant-underline"
        >
          {menuItem.label}
        </button>
      ))}
    </nav>
  );
}

function HeaderRightContent() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const wishlistItems = useSelector((state) => state.shopWishlist.items || []);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [openWishlistSheet, setOpenWishlistSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleLogout() {
    dispatch(logoutUser()).then(() => {
      toast({
        title: "Logged out successfully",
      });
      navigate("/shop/home");
    });
  }

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, isAuthenticated, user?.id]);

  const handleCartClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please login to view cart",
        description: "You'll be redirected to the login page.",
      });
      setTimeout(() => navigate("/auth/login"), 1500);
      return;
    }
    setOpenCartSheet(true);
  };

  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please login to view wishlist",
        description: "You'll be redirected to the login page.",
      });
      setTimeout(() => navigate("/auth/login"), 1500);
      return;
    }
    setOpenWishlistSheet(true);
  };

  return (
    <div className="flex items-center gap-2 lg:gap-3">
      {/* Wishlist */}
      <Sheet open={openWishlistSheet} onOpenChange={setOpenWishlistSheet}>
        <button
          onClick={handleWishlistClick}
          className="relative p-2 hover:bg-gray-50 rounded-lg transition-all duration-300 group"
        >
          <Heart className="w-5 h-5 text-gray-700 group-hover:text-red-500 transition-colors duration-300" />
          {isAuthenticated && wishlistItems?.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-light rounded-full flex items-center justify-center">
              {wishlistItems.length}
            </span>
          )}
        </button>
        {isAuthenticated && (
          <WishlistSheet setOpenWishlistSheet={setOpenWishlistSheet} />
        )}
      </Sheet>

      {/* Cart */}
      <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)}>
        <button
          onClick={handleCartClick}
          className="relative p-2 hover:bg-gray-50 rounded-lg transition-all duration-300 group"
        >
          <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-amber-600 transition-colors duration-300" />
          {isAuthenticated && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs font-light rounded-full flex items-center justify-center">
              {cartItems?.items?.length || 0}
            </span>
          )}
        </button>
        {isAuthenticated && (
          <UserCartWrapper
            setOpenCartSheet={setOpenCartSheet}
            cartItems={
              cartItems?.items?.length > 0 ? cartItems.items : []
            }
          />
        )}
      </Sheet>

      {/* Account or Login */}
      {isAuthenticated && user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-all duration-300">
              <Avatar className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900">
                <AvatarFallback className="bg-transparent text-white text-sm font-light">
                  {user?.userName[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-effect">
            <DropdownMenuLabel className="font-light text-gray-700">
              {user?.userName}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem 
              onClick={() => navigate("/shop/account")}
              className="cursor-pointer font-light"
            >
              <UserCog className="mr-2 h-4 w-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer font-light text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button 
          onClick={() => navigate("/auth/login")}
          className="h-9 px-6 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-light tracking-wide rounded-lg transition-all duration-300"
        >
          Sign In
        </Button>
      )}
    </div>
  );
}

function ShoppingHeader() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      {/* Top info bar - Desktop only */}
      <div className="hidden lg:block border-b border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-10 text-xs font-light text-gray-600">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-amber-500" />
                <span>0736601307</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>6:30 AM - 6:00 PM</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-amber-500" />
                <span>Magic Business Center, Nairobi</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3 h-3 text-amber-500" />
                <span>Express Delivery Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/shop/home" className="flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <img src={logo} alt="Tempara Logo" className="w-full h-full object-cover" />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-lg font-light text-gray-900 tracking-tight">Tempara</span>
              <span className="text-xs font-light text-gray-500 tracking-wide">Premium Toys</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <MenuItems />
          </div>

          {/* Right content */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              <HeaderRightContent />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-50 rounded-lg transition-colors duration-300"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 slide-in-left">
            <div className="space-y-4">
              <MenuItems />
              <div className="pt-4 border-t border-gray-100">
                <HeaderRightContent />
              </div>
              
              {/* Mobile contact info */}
              <div className="pt-4 border-t border-gray-100 space-y-2 text-xs font-light text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-amber-500" />
                  <span>0736601307</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span>6:30 AM - 6:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-amber-500" />
                  <span>Magic Business Center, Nairobi</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default ShoppingHeader;