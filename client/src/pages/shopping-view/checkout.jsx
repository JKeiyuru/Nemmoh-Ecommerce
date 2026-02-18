// client/src/pages/shopping-view/checkout.jsx

/* eslint-disable no-unused-vars */
import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createOrder } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Truck, ShoppingCart, CheckCircle, MessageCircle, Phone, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "254799654321";

// ─── Step components ──────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = [
    { n: 1, label: "Cart" },
    { n: 2, label: "Delivery" },
    { n: 3, label: "Confirm" },
    { n: 4, label: "Done!" },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border-2 transition-all
            ${step >= s.n ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-300 text-gray-400"}`}>
            {step > s.n ? <CheckCircle className="w-4 h-4" /> : s.n}
          </div>
          <span className={`ml-1 text-xs font-medium ${step >= s.n ? "text-gray-900" : "text-gray-400"} ${i < steps.length - 1 ? "mr-3" : ""}`}>
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div className={`w-8 h-0.5 mx-1 ${step > s.n ? "bg-gray-900" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Order Success screen ────────────────────────────────────────────────────
function OrderSuccess({ orderId, totalAmount, phone }) {
  const navigate = useNavigate();
  const whatsappMsg = encodeURIComponent(
    `Hi Kenya Magic Toy Shop! 👋 I just placed an order (ID: #${orderId}). Please confirm it. Thank you!`
  );

  return (
    <div className="max-w-lg mx-auto text-center space-y-6 py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Order Placed! 🎉</h2>
        <p className="text-gray-500 mt-1">Your order has been received and is being prepared.</p>
      </div>

      <Card className="text-left">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order ID</span>
            <span className="font-mono font-semibold">#{String(orderId).slice(-8)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Amount to Pay on Delivery</span>
            <span className="font-bold text-green-700 text-base">KSh {Number(totalAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payment</span>
            <span className="font-medium">💵 Cash on Delivery</span>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 text-left space-y-1">
        <p className="font-semibold">📧 Check your email!</p>
        <p>We&apos;ve sent you an order confirmation with all the details. We&apos;ll also email you when your order is dispatched and delivered.</p>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-gray-600 font-medium">Want to chat with us or track your order?</p>
        <Button
          asChild
          className="w-full h-12 text-base bg-[#25d366] hover:bg-[#1da851] text-white"
        >
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Message Us on WhatsApp
          </a>
        </Button>
        <Button variant="outline" className="w-full" onClick={() => navigate("/shop/account")}>
          <Package className="w-4 h-4 mr-2" /> View My Orders
        </Button>
        <Button variant="ghost" className="w-full text-gray-500" onClick={() => navigate("/shop/home")}>
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}

// ─── Main checkout ─────────────────────────────────────────────────────────────
function ShoppingCheckout() {
  const { cartItems } = useSelector(s => s.shopCart);
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const items = cartItems?.items || [];

  const subtotalAmount = items.reduce((sum, item) =>
    sum + (item.salePrice > 0 ? item.salePrice : item.price) * item.quantity, 0
  );
  const deliveryFee = currentSelectedAddress?.deliveryFee ?? null;
  const totalAmount = deliveryFee !== null ? subtotalAmount + deliveryFee : subtotalAmount;

  // ── Step 1: Cart ────────────────────────────────────────────────────────────
  const CartStep = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Your Cart</h2>
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Your cart is empty.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {items.map(item => <UserCartItemsContent key={item.productId} cartItem={item} />)}
          </div>
          <div className="flex justify-between font-medium text-base pt-2">
            <span>Items Subtotal</span>
            <span>KSh {subtotalAmount.toFixed(2)}</span>
          </div>
          <Button className="w-full h-12" onClick={() => setStep(2)} disabled={items.length === 0}>
            Continue to Delivery →
          </Button>
        </>
      )}
    </div>
  );

  // ── Step 2: Delivery address ────────────────────────────────────────────────
  const DeliveryStep = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Delivery Address</h2>
      <Address
        selectedId={currentSelectedAddress}
        setCurrentSelectedAddress={setCurrentSelectedAddress}
      />
      {currentSelectedAddress && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
          <p className="font-semibold text-green-800 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Address selected
          </p>
          <p className="text-green-700 mt-1">
            {currentSelectedAddress.location}, {currentSelectedAddress.subCounty}, {currentSelectedAddress.county}
          </p>
          <p className="text-green-700">
            Delivery fee: <strong>{currentSelectedAddress.deliveryFee === 0 ? "🎉 FREE" : `KSh ${currentSelectedAddress.deliveryFee}`}</strong>
          </p>
        </div>
      )}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>← Back</Button>
        <Button className="flex-1 h-12" onClick={() => setStep(3)} disabled={!currentSelectedAddress}>
          Review Order →
        </Button>
      </div>
    </div>
  );

  // ── Step 3: Order review & confirm ──────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!currentSelectedAddress) return toast({ title: "Please select a delivery address", variant: "destructive" });
    if (items.length === 0) return toast({ title: "Your cart is empty", variant: "destructive" });

    setIsPlacingOrder(true);
    try {
      const orderData = {
        userId: user?.id,
        cartId: cartItems?._id,
        cartItems: items.map(item => ({
          productId: item.productId,
          title: item.title,
          image: item.image,
          price: item.salePrice > 0 ? item.salePrice : item.price,
          quantity: item.quantity,
        })),
        addressInfo: {
          addressId: currentSelectedAddress._id,
          county: currentSelectedAddress.county,
          subCounty: currentSelectedAddress.subCounty,
          location: currentSelectedAddress.location,
          specificAddress: currentSelectedAddress.specificAddress,
          phone: currentSelectedAddress.phone,
          notes: currentSelectedAddress.notes,
          deliveryFee: currentSelectedAddress.deliveryFee,
          address: currentSelectedAddress.address,
        },
        subtotalAmount,
        deliveryFee: currentSelectedAddress.deliveryFee,
        totalAmount,
        orderDate: new Date(),
      };

      const result = await dispatch(createOrder(orderData));
      if (result?.payload?.success) {
        setCompletedOrder(result.payload);
        setStep(4);
      } else {
        toast({ title: result?.payload?.message || "Failed to place order", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const ConfirmStep = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Confirm Your Order</h2>

      {/* Items */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500 font-medium uppercase tracking-wide">Order Items</CardTitle></CardHeader>
        <CardContent className="pt-0 space-y-2">
          {items.map(item => (
            <div key={item.productId} className="flex justify-between text-sm py-1 border-b last:border-b-0">
              <span className="font-medium">{item.title} <span className="text-gray-400">×{item.quantity}</span></span>
              <span>KSh {((item.salePrice > 0 ? item.salePrice : item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Delivery */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500 font-medium uppercase tracking-wide">Delivery Details</CardTitle></CardHeader>
        <CardContent className="pt-0 text-sm space-y-1">
          <p className="font-medium">{currentSelectedAddress?.location}, {currentSelectedAddress?.subCounty}</p>
          <p className="text-gray-600">{currentSelectedAddress?.specificAddress}</p>
          <p className="text-gray-600">{currentSelectedAddress?.county}</p>
          <p className="flex items-center gap-1 text-gray-600"><Phone className="w-3.5 h-3.5" />{currentSelectedAddress?.phone}</p>
          {currentSelectedAddress?.notes && <p className="text-gray-500 italic">Note: {currentSelectedAddress.notes}</p>}
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardContent className="pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Items Subtotal</span>
            <span>KSh {subtotalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1 text-gray-500"><Truck className="w-3.5 h-3.5" /> Delivery Fee</span>
            <span className={deliveryFee === 0 ? "text-green-600 font-semibold" : ""}>
              {deliveryFee === 0 ? "🎉 FREE" : `KSh ${deliveryFee?.toFixed(2)}`}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-base">
            <span>Total (Pay on Delivery)</span>
            <span className="text-green-700 text-lg">KSh {totalAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        <p className="font-semibold">💵 Cash on Delivery</p>
        <p className="mt-1">Please have <strong>KSh {totalAmount.toFixed(2)}</strong> in cash ready when our delivery agent arrives.</p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => setStep(2)} disabled={isPlacingOrder}>← Back</Button>
        <Button
          className="flex-1 h-12 text-base bg-gray-900 hover:bg-gray-800"
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder}
        >
          {isPlacingOrder ? "Placing Order…" : "✅ Place Order"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      <div className="relative h-[220px] w-full overflow-hidden">
        <img src={img} alt="Checkout" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-white text-3xl font-bold">Checkout</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full px-4 py-8">
        {step < 4 && <StepIndicator step={step} />}

        {step === 1 && <CartStep />}
        {step === 2 && <DeliveryStep />}
        {step === 3 && <ConfirmStep />}
        {step === 4 && (
          <OrderSuccess
            orderId={completedOrder?.orderId || completedOrder?.order?._id}
            totalAmount={totalAmount}
            phone={currentSelectedAddress?.phone}
          />
        )}
      </div>
    </div>
  );
}

export default ShoppingCheckout;