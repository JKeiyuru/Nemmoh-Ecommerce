// client/src/components/admin-view/order-details.jsx

/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersForAdmin, getOrderDetailsForAdmin, updateOrderStatus } from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";
import { Package, Truck, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

const initialFormData = { status: "" };

const STATUS_CONFIG = {
  confirmed:    { color: "bg-green-500",  label: "Confirmed",    icon: <CheckCircle className="w-3.5 h-3.5" /> },
  inProcess:    { color: "bg-blue-500",   label: "Processing",   icon: <Package className="w-3.5 h-3.5" /> },
  inShipping:   { color: "bg-purple-500", label: "Dispatched",   icon: <Truck className="w-3.5 h-3.5" /> },
  delivered:    { color: "bg-emerald-600",label: "Delivered",    icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled:    { color: "bg-red-600",    label: "Cancelled",    icon: <XCircle className="w-3.5 h-3.5" /> },
  rejected:     { color: "bg-red-600",    label: "Rejected",     icon: <XCircle className="w-3.5 h-3.5" /> },
  pending:      { color: "bg-gray-400",   label: "Pending",      icon: <Clock className="w-3.5 h-3.5" /> },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <Badge className={`${cfg.color} flex items-center gap-1 text-white`}>
      {cfg.icon} {cfg.label}
    </Badge>
  );
}

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateStatus(event) {
    event.preventDefault();
    if (!formData.status) return toast({ title: "Please select a status", variant: "destructive" });

    dispatch(updateOrderStatus({ id: orderDetails?._id, orderStatus: formData.status }))
      .then(data => {
        if (data?.payload?.success) {
          dispatch(getOrderDetailsForAdmin(orderDetails?._id));
          dispatch(getAllOrdersForAdmin());
          setFormData(initialFormData);
          toast({ title: "✅ Order status updated successfully!" });
        } else {
          toast({ title: data?.payload?.message || "Update failed", variant: "destructive" });
        }
      });
  }

  if (!orderDetails) return null;

  const isCOD = orderDetails.paymentMethod === "cash_on_delivery";
  const isPaid = orderDetails.paymentStatus === "paid";

  return (
    <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
      <div className="grid gap-5">
        {/* Header info */}
        <div className="grid gap-2 mt-4">
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-500 text-sm">Order ID</p>
            <Label className="font-mono text-xs">{orderDetails._id}</Label>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-500 text-sm">Date</p>
            <Label>{orderDetails.orderDate?.split?.("T")[0]}</Label>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-500 text-sm">Payment Method</p>
            <Label>{isCOD ? "💵 Cash on Delivery" : orderDetails.paymentMethod}</Label>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-500 text-sm">Payment Status</p>
            <Badge className={isPaid ? "bg-green-500" : "bg-amber-500"}>
              {isPaid ? "✅ Paid" : "⏳ Pending (COD)"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-500 text-sm">Order Status</p>
            <StatusBadge status={orderDetails.orderStatus} />
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-500 text-sm">Total Amount</p>
            <Label className="text-xl font-bold text-green-700">KSh {orderDetails.totalAmount}</Label>
          </div>
          {orderDetails.subtotalAmount && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <p>Subtotal</p>
              <p>KSh {orderDetails.subtotalAmount}</p>
            </div>
          )}
          {orderDetails.deliveryAmount !== undefined && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <p>Delivery Fee</p>
              <p>{orderDetails.deliveryAmount === 0 ? "🎉 FREE" : `KSh ${orderDetails.deliveryAmount}`}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* COD note */}
        {isCOD && !isPaid && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <p className="font-semibold flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Cash on Delivery Order</p>
            <p className="mt-1">Mark as <strong>Delivered</strong> once payment is collected. This will automatically mark payment as received.</p>
          </div>
        )}

        {/* Order items */}
        <div>
          <p className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-2">Items</p>
          <ul className="space-y-2">
            {orderDetails.cartItems?.map((item, i) => (
              <li key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm">
                <span className="font-medium">{item.title}</span>
                <span className="text-gray-500">×{item.quantity}</span>
                <span className="font-semibold">KSh {item.price}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Shipping info */}
        <div>
          <p className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-2">Delivery Address</p>
          <div className="bg-gray-50 p-3 rounded-md text-sm space-y-1">
            {orderDetails.addressInfo?.specificAddress && <p>{orderDetails.addressInfo.specificAddress}</p>}
            <p>{orderDetails.addressInfo?.location}, {orderDetails.addressInfo?.subCounty}</p>
            <p>{orderDetails.addressInfo?.county}</p>
            {orderDetails.addressInfo?.phone && <p className="font-medium">📞 {orderDetails.addressInfo.phone}</p>}
            {orderDetails.addressInfo?.notes && <p className="italic text-gray-500">Note: {orderDetails.addressInfo.notes}</p>}
          </div>
        </div>

        <Separator />

        {/* Status update */}
        <div>
          <p className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Update Status</p>
          <CommonForm
            formControls={[{
              label: "New Order Status",
              name: "status",
              componentType: "select",
              options: [
                { id: "confirmed",  label: "✅ Confirmed (Order Received)" },
                { id: "inProcess",  label: "📦 In Process (Picking & Packing)" },
                { id: "inShipping", label: "🚚 Dispatched (Out for Delivery)" },
                { id: "delivered",  label: "🎉 Delivered (Payment Collected)" },
                { id: "cancelled",  label: "❌ Cancelled" },
                { id: "rejected",   label: "❌ Rejected" },
              ],
            }]}
            formData={formData}
            setFormData={setFormData}
            buttonText="Update Status"
            onSubmit={handleUpdateStatus}
          />
          <p className="text-xs text-gray-400 mt-2">
            💡 Setting to <strong>Dispatched</strong> sends the customer a dispatch email. <strong>Delivered</strong> sends a thank-you email and marks payment as received.
          </p>
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;