// client/src/hooks/use-add-to-cart.js
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import { addToCart, fetchCartItems, addGuestItem } from "@/store/shop/cart-slice";

// One shared "add to cart" behavior for every entry point (home, listing,
// search, product-details dialog). Guests get a client-side (localStorage)
// cart; logged-in users get the server-backed cart. Both paths respect
// available stock and show the same toasts, so the experience is identical
// either way — login is only required at checkout.
export function useAddToCart() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems, guestItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);

  // productOverride lets callers that already have the full product object
  // in hand (e.g. the product-details dialog) skip the productList lookup.
  return function addItem(productId, quantity = 1, productOverride = null) {
    const product = productOverride || productList?.find((p) => p._id === productId);
    const totalStock = product?.totalStock;

    const existingQty = isAuthenticated
      ? (cartItems?.items || []).find((i) => i.productId === productId)?.quantity || 0
      : (guestItems || []).find((i) => i.productId === productId)?.quantity || 0;

    if (totalStock != null && existingQty + quantity > totalStock) {
      toast({
        title: `Only ${totalStock} in stock${existingQty ? ` — you already have ${existingQty} in your cart` : ""}`,
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated) {
      if (!product) {
        toast({ title: "Couldn't add that item — please try again", variant: "destructive" });
        return;
      }
      dispatch(addGuestItem({ product, quantity }));
      toast({ title: "Added to cart 🛒" });
      return;
    }

    dispatch(addToCart({ userId: user.id, productId, quantity })).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user.id));
        toast({ title: "Added to cart 🛒" });
      } else {
        toast({ title: data?.payload?.message || "Couldn't add to cart", variant: "destructive" });
      }
    });
  };
}
