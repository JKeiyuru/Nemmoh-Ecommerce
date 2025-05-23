/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
import { Button } from "@/components/ui/button";
import bannerOne from "../../assets/banner-1.webp";
import bannerTwo from "../../assets/banner-2.webp";
import bannerThree from "../../assets/banner-3.webp";
import {
  Airplay,
  BabyIcon,
  BanIcon,
  BatteryFullIcon,
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudLightning,
  DollarSignIcon,
  GiftIcon,
  Heater,
  HomeIcon,
  Images,
  PaintbrushIcon,
  PenToolIcon,
  PuzzleIcon,
  Shirt,
  ShirtIcon,
  ShoppingBagIcon,
  ShoppingBasket,
  StopCircleIcon,
  UmbrellaIcon,
  UsersIcon,
  WashingMachine,
  WatchIcon,
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

const brandsWithIcon = [
{ id: "none", label: "NONE", icon: BanIcon },
  // Toy brands
  { id: "lego", label: "LEGO", icon: PuzzleIcon },
  { id: "mattel", label: "Mattel", icon: BabyIcon },
  { id: "hotwheels", label: "Hot Wheels", icon: Airplay },
  { id: "nerf", label: "Nerf", icon: StopCircleIcon },
  { id: "barbie", label: "Barbie", icon: UsersIcon },
  { id: "hasbro", label: "Hasbro", icon: GiftIcon },
  { id: "fisherprice", label: "Fisher-Price", icon: BookOpenIcon },

  // Board games
  { id: "monopoly", label: "Monopoly", icon: PuzzleIcon },
  { id: "scrabble", label: "Scrabble", icon: PenToolIcon },
  { id: "uno", label: "UNO", icon: DollarSignIcon },

  // Skateboards & accessories
  { id: "element", label: "Element", icon: CloudLightning },
  { id: "zero", label: "Zero", icon: ShoppingBasket },
  { id: "vans", label: "Vans", icon: ShirtIcon }, // also used for skate shoes

  // Mugs & Tumblers
  { id: "stanley", label: "Stanley", icon: UmbrellaIcon },
  { id: "hydroflask", label: "Hydro Flask", icon: WashingMachine },

  // Shoes (doll/flat shoes & sports)
  { id: "crocs", label: "Crocs", icon: Shirt },
  { id: "bata", label: "Bata", icon: PaintbrushIcon },

  // Balls & sports
  { id: "nike", label: "Nike", icon: Shirt },
  { id: "adidas", label: "Adidas", icon: WashingMachine },
  { id: "puma", label: "Puma", icon: ShoppingBasket },
  { id: "wilson", label: "Wilson", icon: WatchIcon }, // tennis
  { id: "spalding", label: "Spalding", icon: Heater }, // basketball

  // Swimming gear
  { id: "speedo", label: "Speedo", icon: PenToolIcon },
  { id: "arena", label: "Arena", icon: DollarSignIcon },
];

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const { user } = useSelector((state) => state.auth);

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
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
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
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  console.log(productList, "productList");

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative w-full h-[600px] overflow-hidden">
        {featureImageList && featureImageList.length > 0
          ? featureImageList.map((slide, index) => (
              <img
                src={slide?.image}
                key={index}
                className={`${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                } absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000`}
              />
            ))
          : null}
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) =>
                (prevSlide - 1 + featureImageList.length) %
                featureImageList.length
            )
          }
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) => (prevSlide + 1) % featureImageList.length
            )
          }
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Shop by category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 bg-white">
            {categoriesWithIcon.map((categoryItem) => (
              <Card
                onClick={() =>
                  handleNavigateToListingPage(categoryItem, "category")
                }
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <categoryItem.icon className="w-12 h-12 mb-4 text-primary" />
                  <span className="font-bold">{categoryItem.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Shop by Brand</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 bg-white">
            {brandsWithIcon.map((brandItem) => (
              // eslint-disable-next-line react/jsx-key
              <Card
                onClick={() => handleNavigateToListingPage(brandItem, "brand")}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <brandItem.icon className="w-12 h-12 mb-4 text-primary" />
                  <span className="font-bold">{brandItem.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Feature Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productList && productList.length > 0
              ? productList.map((productItem) => (
                  <ShoppingProductTile
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                  />
                ))
              : null}
          </div>
        </div>
      </section>
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingHome;
