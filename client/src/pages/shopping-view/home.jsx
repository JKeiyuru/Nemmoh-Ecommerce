/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
// client/src/pages/shopping-view/home.jsx
import { Button } from "@/components/ui/button";
import bannerOne from "../../assets/banner-1.webp";
import bannerThree from "../../assets/banner-3.webp";
import {
  HomeIcon,
  DollarSignIcon,
  BookOpenIcon,
  UsersIcon,
  BatteryFullIcon,
  PuzzleIcon,
  GiftIcon,
  PenToolIcon,
  ShoppingBagIcon,
  PaintbrushIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Sparkles,
  Award,
  Shield,
  Heart,
  TrendingUp,
  Star,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { getFeatureImages } from "@/store/common-slice";
import { fetchWishlist } from "@/store/shop/wishlist-slice";
import TermsAndConditionsSheet from "@/components/shopping-view/terms-conditions-sheet";

const categoriesWithIcon = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "under-100", label: "Under 100/", icon: DollarSignIcon },
  { id: "educational-toys", label: "Educational Toys", icon: BookOpenIcon },
  { id: "pretend-play", label: "Pretend Play & Role Play", icon: UsersIcon },
  { id: "action-outdoor", label: "Action & Outdoor", icon: BatteryFullIcon },
  { id: "card-board-games", label: "Card & Board Games", icon: PuzzleIcon },
  { id: "party-supplies", label: "Party Supplies", icon: GiftIcon },
  { id: "stationery-school", label: "Stationery & School", icon: PenToolIcon },
  { id: "fashion-accessories", label: "Fashion & Accessories", icon: ShoppingBagIcon },
  { id: "home-decor", label: "Home & Decor", icon: PaintbrushIcon },
];

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId) {
    if (!isAuthenticated || !user) {
      toast({
        title: "Please login to add items to cart.",
        description: "You'll be redirected to the login page.",
        variant: "default",
      });
      setTimeout(() => navigate("/auth/login"), 1500);
      return;
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({ title: "Product is added to cart" });
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % featureImageList.length);
    }, 15000);
    return () => clearInterval(timer);
  }, [featureImageList]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {
          category: ["educational-toys", "card-board-games"]
        },
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchWishlist(user.id));
    }
  }, [dispatch, isAuthenticated, user?.id]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Minimal Hero Section - Just enough to intrigue */}
      <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white z-10" />
        
        {featureImageList && featureImageList.length > 0 &&
          featureImageList.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ${
                index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
            >
              <img
                src={slide?.image}
                alt={`Featured ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        
        {/* Minimal navigation */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) =>
                (prevSlide - 1 + featureImageList.length) %
                featureImageList.length
            )
          }
          className="absolute top-1/2 left-4 transform -translate-y-1/2 z-20 glass-effect rounded-full w-10 h-10 hover:bg-white/90 transition-all duration-300"
        >
          <ChevronLeftIcon className="w-4 h-4 text-gray-700" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) => (prevSlide + 1) % featureImageList.length
            )
          }
          className="absolute top-1/2 right-4 transform -translate-y-1/2 z-20 glass-effect rounded-full w-10 h-10 hover:bg-white/90 transition-all duration-300"
        >
          <ChevronRightIcon className="w-4 h-4 text-gray-700" />
        </Button>

        {/* Minimal slide indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-1.5">
          {featureImageList.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? "w-6 bg-white" 
                  : "w-1 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Compact Intro with CTA - draws eye to products below */}
      <section className="py-8 md:py-12 bg-gradient-to-b from-white to-gray-50/30">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 mb-4 fade-in">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-light text-amber-900 tracking-wide">Handpicked Collection</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 mb-3 tracking-tight fade-in">
            Educational Toys & Timeless Games
          </h1>
          
          <p className="text-sm md:text-base text-gray-600 font-light max-w-2xl mx-auto mb-6 fade-in">
            Premium quality products that inspire learning, creativity, and family bonding
          </p>

          {/* Quick category pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {categoriesWithIcon.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleNavigateToListingPage(cat, "category")}
                className="px-4 py-2 text-xs font-light text-gray-700 bg-white border border-gray-200 rounded-full hover:border-amber-300 hover:bg-amber-50 transition-all duration-300"
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN FOCUS: Featured Products - Large, Prominent Display */}
      <section className="py-8 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Minimal header - doesn't compete with products */}
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-amber-400 to-yellow-500 rounded-full" />
              <div>
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 tracking-tight">
                  Featured Products
                </h2>
                <p className="text-xs md:text-sm text-gray-500 font-light mt-0.5">
                  {productList?.length || 0} items available
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => navigate("/shop/listing")}
              variant="ghost"
              className="text-sm font-light text-gray-700 hover:text-amber-600 elegant-underline"
            >
              View All
            </Button>
          </div>

          {/* Products Grid - The Star of the Show */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {productList && productList.length > 0 ? (
              productList.map((productItem, index) => (
                <div 
                  key={productItem._id}
                  className="fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ShoppingProductTile
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-gray-500 font-light">Loading products...</p>
              </div>
            )}
          </div>

          {/* Browse more CTA */}
          <div className="text-center mt-12 md:mt-16">
            <Button
              onClick={() => navigate("/shop/listing")}
              className="h-12 px-8 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-light tracking-wide rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Explore Full Collection
            </Button>
          </div>
        </div>
      </section>

      {/* Compact Categories - Secondary to products */}
      <section className="py-12 md:py-16 bg-gray-50/50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-2">
              Shop by Category
            </h2>
            <p className="text-sm text-gray-600 font-light">
              Curated collections for every interest
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {categoriesWithIcon.map((categoryItem, index) => (
              <button
                key={categoryItem.id}
                onClick={() => handleNavigateToListingPage(categoryItem, "category")}
                className="group p-4 md:p-6 bg-white border border-gray-100 rounded-xl hover:border-amber-200 hover:shadow-md transition-all duration-300 fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-gray-50 group-hover:bg-amber-50 transition-colors duration-300">
                    <categoryItem.icon className="w-6 h-6 md:w-7 md:h-7 text-gray-600 group-hover:text-amber-600 transition-colors duration-300" />
                  </div>
                  <span className="text-xs md:text-sm font-light text-gray-700 text-center group-hover:text-gray-900 transition-colors duration-300">
                    {categoryItem.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Minimal Trust Signals - Compact, bottom of page */}
      <section className="py-12 md:py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-2 fade-in">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-sm font-light text-gray-900">Curated Selection</h3>
              <p className="text-xs text-gray-600 font-light">
                Every product handpicked for quality
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-2 fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <Heart className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-sm font-light text-gray-900">Family Owned</h3>
              <p className="text-xs text-gray-600 font-light">
                Real people, real care
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-2 fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-sm font-light text-gray-900">Secure Shopping</h3>
              <p className="text-xs text-gray-600 font-light">
                Your data is protected
              </p>
            </div>
          </div>
        </div>
      </section>

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />

      {/* Minimal Footer */}
      <footer className="bg-gray-50 py-8 border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div>
              <p className="text-sm text-gray-600 font-light">
                © 2025 Kenya Magic Toy Shop
              </p>
              <p className="text-xs text-gray-500 font-light mt-0.5">
                Premium toys for thoughtful families
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <TermsAndConditionsSheet />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ShoppingHome;