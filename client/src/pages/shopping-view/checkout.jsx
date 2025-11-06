/* eslint-disable react/jsx-key */
/* eslint-disable no-unused-vars */
// client/src/pages/shopping-view/checkout.jsx
import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createNewOrder, createManualPaymentOrder } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Truck, ShoppingCart, CreditCard, Phone, CheckCircle, Info } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);
  const [isMpesaPaymentLoading, setIsMpesaPaymentLoading] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showManualPayment, setShowManualPayment] = useState(false);
  const [isManualPaymentLoading, setIsManualPaymentLoading] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Paybill Details - Replace with your actual details
  const PAYBILL_NUMBER = "247247"; // Replace with your actual paybill number
  const ACCOUNT_NUMBER = "KENYAMAGIC"; // Replace with your account number format

  // Redirect to PayPal approval URL if present
  useEffect(() => {
    if (approvalURL) {
      window.location.href = approvalURL;
    }
  }, [approvalURL]);

  // Calculate subtotal (items only)
  const subtotalAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  // Get delivery fee from selected address
  const deliveryFee = currentSelectedAddress?.deliveryFee || 0;

  // Calculate total amount (subtotal + delivery)
  const totalCartAmount = subtotalAmount + deliveryFee;

  function handleInitiatePaypalPayment() {
    if (!cartItems || !cartItems.items || cartItems.items.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }
    if (!currentSelectedAddress) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((item) => ({
        productId: item?.productId,
        title: item?.title,
        image: item?.image,
        price: item?.salePrice > 0 ? item.salePrice : item.price,
        quantity: item.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        county: currentSelectedAddress?.county,
        subCounty: currentSelectedAddress?.subCounty,
        location: currentSelectedAddress?.location,
        specificAddress: currentSelectedAddress?.specificAddress,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
        deliveryFee: currentSelectedAddress?.deliveryFee,
      },
      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "pending",
      subtotalAmount: subtotalAmount,
      deliveryFee: deliveryFee,
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    setIsPaymentStart(true);
    dispatch(createNewOrder(orderData)).then((data) => {
      if (!data?.payload?.success) {
        setIsPaymentStart(false);
        toast({
          title: "Failed to start PayPal payment. Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  const handleMpesaPayment = async () => {
    if (!cartItems || !cartItems.items || cartItems.items.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }
    if (!currentSelectedAddress) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    if (!showPhoneInput) {
      setShowPhoneInput(true);
      return;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsMpesaPaymentLoading(true);

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((item) => ({
        productId: item?.productId,
        title: item?.title,
        image: item?.image,
        price: item?.salePrice > 0 ? item.salePrice : item.price,
        quantity: item.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        county: currentSelectedAddress?.county,
        subCounty: currentSelectedAddress?.subCounty,
        location: currentSelectedAddress?.location,
        specificAddress: currentSelectedAddress?.specificAddress,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
        deliveryFee: currentSelectedAddress?.deliveryFee,
      },
      orderStatus: "pending",
      paymentMethod: "mpesa",
      paymentStatus: "pending",
      subtotalAmount: subtotalAmount,
      deliveryFee: deliveryFee,
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    try {
      const response = await axios.post("/api/shop/payment", {
        phone: phoneNumber,
        amount: totalCartAmount,
        callbackUrl: `${API_BASE_URL}/api/shop/mpesa-callback`,
        orderData,
      });

      if (response.data.success) {
        toast({
          title: "M-Pesa payment initiated. Please check your phone.",
          variant: "default",
        });
        setShowPhoneInput(false);
        setPhoneNumber("");
      } else {
        toast({
          title: "Failed to initiate M-Pesa payment. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "M-Pesa payment failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMpesaPaymentLoading(false);
    }
  };

  const handleManualPayment = async () => {
    if (!cartItems || !cartItems.items || cartItems.items.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }
    if (!currentSelectedAddress) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsManualPaymentLoading(true);

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((item) => ({
        productId: item?.productId,
        title: item?.title,
        image: item?.image,
        price: item?.salePrice > 0 ? item.salePrice : item.price,
        quantity: item.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        county: currentSelectedAddress?.county,
        subCounty: currentSelectedAddress?.subCounty,
        location: currentSelectedAddress?.location,
        specificAddress: currentSelectedAddress?.specificAddress,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
        deliveryFee: currentSelectedAddress?.deliveryFee,
      },
      orderStatus: "pending_verification",
      paymentMethod: "manual_mpesa",
      paymentStatus: "awaiting_verification",
      subtotalAmount: subtotalAmount,
      deliveryFee: deliveryFee,
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    };

    try {
      const result = await dispatch(createManualPaymentOrder(orderData));
      
      if (result?.payload?.success) {
        toast({
          title: "Order placed successfully!",
          description: "Please complete payment via M-Pesa and we'll verify it shortly.",
        });
        
        // Redirect to account page to see order
        setTimeout(() => {
          window.location.href = "/shop/account";
        }, 2000);
      } else {
        toast({
          title: "Failed to place order",
          description: result?.payload?.message || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error placing order",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsManualPaymentLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} alt="Checkout Banner" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <h1 className="text-white text-4xl font-bold">Checkout</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 p-6">
        {/* Address Selection */}
        <div className="space-y-6">
          <Address
            selectedId={currentSelectedAddress}
            setCurrentSelectedAddress={setCurrentSelectedAddress}
          />
          
          {/* Selected Address Summary */}
          {currentSelectedAddress && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Delivery Information
                </h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Location:</strong> {currentSelectedAddress.location}, {currentSelectedAddress.subCounty}</p>
                  <p><strong>Address:</strong> {currentSelectedAddress.specificAddress}</p>
                  <p><strong>Phone:</strong> {currentSelectedAddress.phone}</p>
                  <p><strong>Delivery Fee:</strong> <span className="font-semibold text-blue-600">KSh {currentSelectedAddress.deliveryFee}</span></p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Order Summary
              </h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems?.items?.length > 0 ? (
                  cartItems.items.map((item) => (
                    <UserCartItemsContent key={item.productId} cartItem={item} />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                )}
              </div>

              {/* Order Totals */}
              {cartItems?.items?.length > 0 && (
                <div className="space-y-3">
                  <Separator />
                  
                  {/* Subtotal */}
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cartItems.items.length} items)</span>
                    <span>KSh {subtotalAmount.toFixed(2)}</span>
                  </div>
                  
                  {/* Delivery Fee */}
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Delivery Fee
                    </span>
                    <span className={deliveryFee > 0 ? "text-blue-600 font-medium" : "text-gray-500"}>
                      {deliveryFee > 0 ? `KSh ${deliveryFee.toFixed(2)}` : "Select address"}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  {/* Total */}
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-green-600">KSh {totalCartAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          {cartItems?.items?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Manual M-Pesa Payment (Primary Option) */}
                <div className="space-y-3">
                  {!showManualPayment ? (
                    <Button
                      onClick={() => setShowManualPayment(true)}
                      className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
                      disabled={!currentSelectedAddress}
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      Pay via M-Pesa (Recommended)
                    </Button>
                  ) : (
                    <div className="space-y-4 border-2 border-green-500 rounded-lg p-4">
                      <Alert className="bg-green-50 border-green-200">
                        <Info className="w-4 h-4" />
                        <AlertTitle className="font-semibold">M-Pesa Payment Instructions</AlertTitle>
                        <AlertDescription className="mt-2 space-y-2 text-sm">
                          <p className="font-medium">Follow these steps to complete your payment:</p>
                          <ol className="list-decimal list-inside space-y-1 ml-2">
                            <li>Go to <strong>M-Pesa</strong> on your phone</li>
                            <li>Select <strong>Lipa na M-Pesa</strong></li>
                            <li>Select <strong>Paybill</strong></li>
                            <li>Enter Business Number: <strong className="text-green-700">{PAYBILL_NUMBER}</strong></li>
                            <li>Enter Account Number: <strong className="text-green-700">{ACCOUNT_NUMBER}</strong></li>
                            <li>Enter Amount: <strong className="text-green-700">KSh {totalCartAmount.toFixed(2)}</strong></li>
                            <li>Enter your M-Pesa PIN</li>
                            <li>Click &quot;Complete Order&quot; below after sending payment</li>
                          </ol>
                          <div className="mt-3 p-3 bg-white rounded border border-green-300">
                            <p className="font-semibold text-green-800">Payment Details:</p>
                            <p className="text-xs mt-1">Paybill: <span className="font-mono font-bold">{PAYBILL_NUMBER}</span></p>
                            <p className="text-xs">Account: <span className="font-mono font-bold">{ACCOUNT_NUMBER}</span></p>
                            <p className="text-xs">Amount: <span className="font-mono font-bold">KSh {totalCartAmount.toFixed(2)}</span></p>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            <strong>Note:</strong> Your order will be verified within 1-2 hours. 
                            For urgent orders, call <strong>0799 654 321</strong>.
                          </p>
                        </AlertDescription>
                      </Alert>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={handleManualPayment}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          disabled={isManualPaymentLoading}
                        >
                          {isManualPaymentLoading ? (
                            "Processing..."
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Complete Order
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => setShowManualPayment(false)}
                          variant="outline"
                          disabled={isManualPaymentLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Other Payment Options
                    </span>
                  </div>
                </div>
                
                {/* PayPal Payment */}
                <Button 
                  onClick={handleInitiatePaypalPayment} 
                  className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700" 
                  disabled={isPaymentStart || !currentSelectedAddress}
                  variant="outline"
                >
                  {isPaymentStart ? "Processing PayPal Payment..." : `Pay KSh ${totalCartAmount.toFixed(2)} with PayPal`}
                </Button>
                
                {/* STK Push (Coming Soon) */}
                <div className="relative">
                  <Button
                    className="w-full h-12 text-lg bg-gray-400 cursor-not-allowed"
                    disabled
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    M-Pesa STK Push (Coming Soon)
                  </Button>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      Coming Soon
                    </span>
                  </div>
                </div>
                
                {!currentSelectedAddress && (
                  <p className="text-sm text-red-500 text-center">
                    Please select a delivery address to continue
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;