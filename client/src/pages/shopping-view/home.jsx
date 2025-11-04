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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white">
      {/* Hero Banner with Elegant Carousel */}
      <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
        {/* Gradient overlay for sophistication */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white/40 z-10" />
        
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
        
        {/* Elegant navigation buttons */}
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
          className="absolute top-1/2 left-4 md:left-8 transform -translate-y-1/2 z-20 glass-effect rounded-full w-12 h-12 hover:bg-white/90 transition-all duration-300"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) => (prevSlide + 1) % featureImageList.length
            )
          }
          className="absolute top-1/2 right-4 md:right-8 transform -translate-y-1/2 z-20 glass-effect rounded-full w-12 h-12 hover:bg-white/90 transition-all duration-300"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-700" />
        </Button>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {featureImageList.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? "w-8 bg-white" 
                  : "w-1 bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Elegant spacing */}
      <div className="h-16 md:h-24" />

      {/* Categories Section with Luxury Design */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-12 md:mb-16 fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-3 tracking-tight">
              Discover Our Collection
            </h2>
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4" />
            <p className="text-gray-600 font-light text-sm md:text-base tracking-wide">
              Curated categories for discerning families
            </p>
          </div>

          {/* Category grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 stagger-fade-in">
            {categoriesWithIcon.map((categoryItem, index) => (
              <Card
                key={categoryItem.id}
                onClick={() =>
                  handleNavigateToListingPage(categoryItem, "category")
                }
                className="product-card-luxury cursor-pointer group"
              >
                <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
                  <div className="w-16 h-16 md:w-20 md:h-20 mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-50 to-amber-50 group-hover:from-amber-50 group-hover:to-yellow-50 transition-all duration-500">
                    <categoryItem.icon className="w-8 h-8 md:w-10 md:h-10 text-gray-700 group-hover:text-amber-600 transition-colors duration-300" />
                  </div>
                  <span className="font-light text-sm md:text-base text-gray-700 text-center group-hover:text-gray-900 transition-colors duration-300">
                    {categoryItem.label}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-16 md:py-24 luxury-gradient">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8 fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-gray-200/50">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-light text-gray-700 tracking-wide">Our Story</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 leading-tight">
              A Family-First Toy Haven
            </h2>
            
            <p className="text-gray-600 font-light text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
              Born from a mother of five's passion for child-driven development, our family-run business 
              is committed to rediscovering joy beyond screens — encouraging creativity, play, and family 
              bonding through classic and new-age games.
            </p>

            {/* Value propositions */}
            <div className="grid md:grid-cols-3 gap-8 md:gap-12 pt-8">
              <div className="flex flex-col items-center space-y-3 slide-in-left">
                <div className="w-16 h-16 rounded-full bg-white shadow-luxury flex items-center justify-center">
                  <Award className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-light text-gray-900">Curated Selection</h3>
                <p className="text-sm text-gray-600 font-light leading-relaxed">
                  We stay ahead of trends and dig into the archives of forgotten fun — reviving excitement with every product.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-3 slide-in-left" style={{ animationDelay: '0.1s' }}>
                <div className="w-16 h-16 rounded-full bg-white shadow-luxury flex items-center justify-center">
                  <Heart className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-light text-gray-900">Personal Touch</h3>
                <p className="text-sm text-gray-600 font-light leading-relaxed">
                  From order to doorstep, we are with you. Real people, real follow-up, real support.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-3 slide-in-left" style={{ animationDelay: '0.2s' }}>
                <div className="w-16 h-16 rounded-full bg-white shadow-luxury flex items-center justify-center">
                  <Shield className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-light text-gray-900">Secure Shopping</h3>
                <p className="text-sm text-gray-600 font-light leading-relaxed">
                  Our encrypted payment gateway ensures your personal and payment info stays safe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-12 md:mb-16 fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-3 tracking-tight">
              Featured Collection
            </h2>
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4" />
            <p className="text-gray-600 font-light text-sm md:text-base tracking-wide">
              Handpicked educational treasures and timeless games
            </p>
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {productList && productList.length > 0 &&
              productList.map((productItem, index) => (
                <div 
                  key={productItem._id}
                  className="fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ShoppingProductTile
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                  />
                </div>
              ))}
          </div>
        </div>
      </section>

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />

      {/* Elegant Footer */}
      <footer className="bg-gradient-to-b from-gray-50 to-gray-100 py-12 md:py-16 mt-16 border-t border-gray-200/50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-600 font-light">
                © 2025 Kenya Magic Toy Shop. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 font-light mt-1">
                Crafted with care for families
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <TermsAndConditionsSheet />
              <p className="text-xs text-gray-500 font-light max-w-md text-center">
                By using our website, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ShoppingHome;