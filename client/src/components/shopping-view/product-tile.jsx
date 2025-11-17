/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// client/src/components/shopping-view/product-tile.jsx
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { Heart, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  addToWishlist,
  removeFromWishlist,
  fetchWishlist,
} from "@/store/shop/wishlist-slice";
import { useToast } from "../ui/use-toast";
import { useState, useEffect } from "react";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const wishlistState = useSelector((state) => state.shopWishlist);
  const wishlistItems = wishlistState?.items || [];

  const isWishlisted = wishlistItems.some((item) => item._id === product._id);

  // NEW: Image slider state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Get all product images
  const productImages = product?.images && product.images.length > 0 
    ? product.images 
    : product?.image 
    ? [product.image]
    : product?.variations && product.variations.length > 0
    ? [product.variations[0].image]
    : [];

  const hasMultipleImages = productImages.length > 1;

  // Auto-slide on hover
  useEffect(() => {
    let interval;
    if (isHovering && hasMultipleImages) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
      }, 1500); // Change image every 1.5 seconds when hovering
    } else {
      setCurrentImageIndex(0); // Reset to first image when not hovering
    }
    return () => clearInterval(interval);
  }, [isHovering, productImages.length, hasMultipleImages]);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const toggleWishlist = async (e) => {
    e.stopPropagation();

    if (!isAuthenticated || !user) {
      toast({
        title: "Please login to use wishlist.",
        description: "You'll be redirected to the login page.",
        variant: "default",
      });
      setTimeout(() => navigate("/auth/login"), 1500);
      return;
    }

    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlist({ userId: user.id, productId: product._id }));
        toast({
          title: "Removed from wishlist",
        });
      } else {
        await dispatch(addToWishlist({ userId: user.id, productId: product._id }));
        toast({
          title: "Added to wishlist",
        });
      }

      dispatch(fetchWishlist(user.id));
    } catch (err) {
      toast({
        title: "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated || !user) {
      toast({
        title: "Please login to add items to cart.",
        description: "You'll be redirected to the login page.",
        variant: "default",
      });
      setTimeout(() => navigate("/auth/login"), 1500);
      return;
    }
    
    handleAddtoCart(product?._id, product?.totalStock);
  };

  return (
    <Card className="group relative overflow-hidden bg-white border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:shadow-luxury-lg rounded-xl">
      {/* Wishlist Button */}
      <button
        onClick={toggleWishlist}
        className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full glass-effect flex items-center justify-center transition-all duration-300 hover:bg-white/90 hover:scale-110"
      >
        <Heart
          className={`w-5 h-5 transition-all duration-300 ${
            isWishlisted
              ? "fill-red-500 text-red-500"
              : "text-gray-600 group-hover:text-red-400"
          }`}
        />
      </button>

      {/* Product Image Section with Slider */}
      <div
        onClick={() => handleGetProductDetails(product?._id)}
        className="relative cursor-pointer overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Image container */}
        <div className="relative h-[280px] md:h-[320px] overflow-hidden bg-gray-50">
          {productImages.length > 0 ? (
            productImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${product?.title} - ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                  index === currentImageIndex 
                    ? "opacity-100 scale-100" 
                    : "opacity-0 scale-105"
                }`}
              />
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Image navigation buttons - only show if multiple images */}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>

              {/* Image indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {productImages.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? "w-6 bg-white" 
                        : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasMultipleImages && (
            <Badge className="glass-effect border-0 text-xs font-light tracking-wide px-3 py-1">
              <span className="text-gray-700">{productImages.length} photos</span>
            </Badge>
          )}
          {product?.totalStock === 0 ? (
            <Badge className="glass-effect border-0 text-xs font-light tracking-wide px-3 py-1">
              <span className="text-gray-700">Out Of Stock</span>
            </Badge>
          ) : product?.totalStock < 10 ? (
            <Badge className="bg-amber-50/90 backdrop-blur-sm border border-amber-200/50 text-amber-900 text-xs font-light tracking-wide px-3 py-1 hover:bg-amber-50">
              Only {product?.totalStock} left
            </Badge>
          ) : product?.salePrice > 0 ? (
            <Badge className="bg-gradient-to-r from-amber-400 to-yellow-400 border-0 text-white text-xs font-light tracking-wide px-3 py-1 shadow-lg">
              Special Offer
            </Badge>
          ) : null}
        </div>
      </div>

      {/* Product Details */}
      <CardContent
        onClick={() => handleGetProductDetails(product?._id)}
        className="p-5 cursor-pointer space-y-3"
      >
        {/* Category */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-light text-gray-500 tracking-widest uppercase">
            {categoryOptionsMap[product?.category]}
          </span>
        </div>

        {/* Product Title */}
        <h3 className="text-base md:text-lg font-light text-gray-900 leading-snug line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
          {product?.title}
        </h3>

        {/* Price Section */}
        <div className="flex items-center gap-3">
          {product?.salePrice > 0 ? (
            <>
              <span className="text-lg md:text-xl font-light text-gray-400 line-through">
                KES {product?.price}
              </span>
              <span className="text-xl md:text-2xl font-light text-amber-600">
                KES {product?.salePrice}
              </span>
            </>
          ) : (
            <span className="text-xl md:text-2xl font-light text-gray-900">
              KES {product?.price}
            </span>
          )}
        </div>

        {/* Savings badge for sale items */}
        {product?.salePrice > 0 && (
          <div className="inline-flex items-center gap-1 text-xs text-amber-700 font-light">
            <span>Save KES {product?.price - product?.salePrice}</span>
          </div>
        )}
      </CardContent>

      {/* Add to Cart Button */}
      <CardFooter className="p-5 pt-0">
        {product?.totalStock === 0 ? (
          <Button
            disabled
            className="w-full h-11 bg-gray-100 text-gray-400 hover:bg-gray-100 cursor-not-allowed rounded-lg font-light tracking-wide"
          >
            Out Of Stock
          </Button>
        ) : (
          <Button
            onClick={handleAddToCartClick}
            className="w-full h-11 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-lg font-light tracking-wide transition-all duration-300 group/btn shadow-md hover:shadow-lg"
          >
            <ShoppingBag className="w-4 h-4 mr-2 transition-transform duration-300 group-hover/btn:scale-110" />
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;