// client/src/components/shopping-view/order-details.jsx

/* eslint-disable react/prop-types */
import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Truck, Package, CheckCircle, XCircle, Clock, Phone, MapPin } from "lucide-react";

const STATUS_CONFIG = {
  confirmed:    { color: "bg-green-500",   label: "Confirmed — we're getting your order ready!" },
  inProcess:    { color: "bg-blue-500",    label: "Being Prepared — your items are being packed." },
  inShipping:   { color: "bg-purple-500",  label: "On the Way! — your order is out for delivery." },
  delivered:    { color: "bg-emerald-600", label: "Delivered — enjoy your purchase! 🎉" },
  cancelled:    { color: "bg-red-500",     label: "Cancelled" },
  rejected:     { color: "bg-red-500",     label: "Rejected" },
  pending:      { color: "bg-gray-400",    label: "Pending" },
};

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector(s => s.auth);
  if (!orderDetails) return null;

  const statusCfg = STATUS_CONFIG[orderDetails.orderStatus] || STATUS_CONFIG.pending;

  return (
    <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
      <div className="grid gap-5 mt-4">
        {/* Status banner */}
        <div className={`${statusCfg.color} text-white rounded-lg p-3 text-sm text-center font-medium`}>
          {statusCfg.label}
        </div>

        {/* Order meta */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-500">Order ID</p>
            <Label className="font-mono text-xs">#{orderDetails._id?.slice(-8)}</Label>
          </div>
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-500">Order Date</p>
            <Label>{orderDetails.orderDate?.split("T")[0]}</Label>
          </div>
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-500">Payment</p>
            <Label>💵 Cash on Delivery</Label>
          </div>
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-500">Payment Status</p>
            <Badge className={orderDetails.paymentStatus === "paid" ? "bg-green-500" : "bg-amber-500"}>
              {orderDetails.paymentStatus === "paid" ? "✅ Paid" : "⏳ Pay on delivery"}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Items */}
        <div>
          <p className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-2">Items Ordered</p>
          <ul className="space-y-2">
            {orderDetails.cartItems?.map((item, i) => (
              <li key={i} className="flex items-center justify-between text-sm py-1.5 border-b last:border-b-0">
                <span className="font-medium">{item.title}</span>
                <span className="text-gray-400 mx-2">×{item.quantity}</span>
                <span className="font-semibold">KSh {item.price}</span>
              </li>
            ))}
          </ul>

          <div className="mt-3 space-y-1 text-sm">
            {orderDetails.subtotalAmount && (
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>KSh {orderDetails.subtotalAmount}</span>
              </div>
            )}
            {orderDetails.deliveryAmount !== undefined && (
              <div className="flex justify-between text-gray-500">
                <span>Delivery</span>
                <span>{orderDetails.deliveryAmount === 0 ? "🎉 FREE" : `KSh ${orderDetails.deliveryAmount}`}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1 border-t">
              <span>Total to Pay</span>
              <span className="text-green-700">KSh {orderDetails.totalAmount}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Delivery address */}
        <div>
          <p className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-2">Delivery Address</p>
          <div className="text-sm space-y-1 text-gray-700">
            <p className="font-medium">{user?.userName}</p>
            {orderDetails.addressInfo?.specificAddress && <p className="flex items-start gap-1"><MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{orderDetails.addressInfo.specificAddress}</p>}
            <p>{orderDetails.addressInfo?.location}, {orderDetails.addressInfo?.subCounty}</p>
            <p>{orderDetails.addressInfo?.county}</p>
            {orderDetails.addressInfo?.phone && (
              <p className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{orderDetails.addressInfo.phone}</p>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;