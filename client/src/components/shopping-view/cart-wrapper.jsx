/* eslint-disable react/jsx-key */
/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { LogIn, ShoppingBag } from "lucide-react";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  const isEmpty = !cartItems || cartItems.length === 0;

  function handleCheckoutClick() {
    setOpenCartSheet(false);
    if (!isAuthenticated) {
      // Send them to login, remembering to bounce back to checkout afterwards.
      navigate("/auth/login", { state: { from: { pathname: "/shop/checkout" } } });
      return;
    }
    navigate("/shop/checkout");
  }

  return (
    <SheetContent className="sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Your Cart</SheetTitle>
      </SheetHeader>

      <div className="mt-8 space-y-4">
        {!isEmpty ? (
          cartItems.map((item) => <UserCartItemsContent cartItem={item} />)
        ) : (
          <div className="text-center py-10 text-gray-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Your cart is empty</p>
          </div>
        )}
      </div>

      {!isEmpty && (
        <div className="mt-8 space-y-4">
          <div className="flex justify-between">
            <span className="font-bold">Total</span>
            <span className="font-bold">KES {totalCartAmount}</span>
          </div>
        </div>
      )}

      {!isAuthenticated && !isEmpty && (
        <p className="text-xs text-center text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mt-4">
          You&apos;ll need to sign in to complete checkout — your cart will be waiting for you.
        </p>
      )}

      <Button
        onClick={handleCheckoutClick}
        disabled={isEmpty}
        className="w-full mt-6"
      >
        {!isAuthenticated ? (
          <>
            <LogIn className="w-4 h-4 mr-2" /> Sign In to Checkout
          </>
        ) : (
          "Checkout"
        )}
      </Button>
    </SheetContent>
  );
}

export default UserCartWrapper;
