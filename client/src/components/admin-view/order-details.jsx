/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// client/src/components/admin-view/order-details.jsx
import { useState } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  verifyPayment,
  rejectPayment,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const [paymentNote, setPaymentNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const needsVerification = 
    orderDetails?.orderStatus === "pending_verification" &&
    orderDetails?.paymentStatus === "awaiting_verification";

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message,
        });
      }
    });
  }

  async function handleVerifyPayment() {
    if (!paymentNote.trim()) {
      toast({
        title: "Please add a verification note",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const result = await dispatch(
        verifyPayment({ 
          id: orderDetails?._id, 
          paymentNote: paymentNote.trim() 
        })
      );

      if (result?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setPaymentNote("");
        setShowVerificationForm(false);
        toast({
          title: "✅ Payment Verified!",
          description: "Order confirmed and customer notified via email.",
        });
      } else {
        toast({
          title: "Verification failed",
          description: result?.payload?.message || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error verifying payment",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleRejectPayment() {
    if (!rejectionReason.trim()) {
      toast({
        title: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    setIsRejecting(true);
    try {
      const result = await dispatch(
        rejectPayment({ 
          id: orderDetails?._id, 
          rejectionReason: rejectionReason.trim() 
        })
      );

      if (result?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setRejectionReason("");
        setShowRejectionForm(false);
        toast({
          title: "Payment Rejected",
          description: "Order has been cancelled.",
        });
      } else {
        toast({
          title: "Rejection failed",
          description: result?.payload?.message || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error rejecting payment",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
    }
  }

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <div className="grid gap-6">
        {/* Verification Alert */}
        {needsVerification && (
          <Alert className="bg-yellow-50 border-yellow-300">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800 font-semibold">
              Payment Verification Required
            </AlertTitle>
            <AlertDescription className="text-yellow-700">
              This order is awaiting manual payment verification. 
              Please check if the payment has been received and verify or reject below.
            </AlertDescription>
          </Alert>
        )}

        {/* Order Info */}
        <div className="grid gap-2">
          <div className="flex mt-6 items-center justify-between">
            <p className="font-medium">Order ID</p>
            <Label className="font-mono text-sm">{orderDetails?._id}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Date</p>
            <Label>{orderDetails?.orderDate.split("T")[0]}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Price</p>
            <Label className="text-lg font-semibold">
              KSh {orderDetails?.totalAmount}
            </Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment method</p>
            <Label>
              {orderDetails?.paymentMethod === "manual_mpesa" 
                ? "Manual M-Pesa" 
                : orderDetails?.paymentMethod}
            </Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment Status</p>
            <Label>
              <Badge
                className={`py-1 px-3 ${
                  orderDetails?.paymentStatus === "paid"
                    ? "bg-green-500"
                    : orderDetails?.paymentStatus === "awaiting_verification"
                    ? "bg-yellow-500"
                    : orderDetails?.paymentStatus === "failed"
                    ? "bg-red-600"
                    : "bg-gray-400"
                }`}
              >
                {orderDetails?.paymentStatus}
              </Badge>
            </Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Status</p>
            <Label>
              <Badge
                className={`py-1 px-3 ${
                  orderDetails?.orderStatus === "confirmed"
                    ? "bg-green-500"
                    : orderDetails?.orderStatus === "pending_verification"
                    ? "bg-yellow-500"
                    : orderDetails?.orderStatus === "rejected" || 
                      orderDetails?.orderStatus === "cancelled"
                    ? "bg-red-600"
                    : "bg-black"
                }`}
              >
                {orderDetails?.orderStatus}
              </Badge>
            </Label>
          </div>
          
          {orderDetails?.paymentVerificationNote && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <p className="text-sm font-medium text-gray-700">Verification Note:</p>
              <p className="text-sm text-gray-600 mt-1">
                {orderDetails.paymentVerificationNote}
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Payment Verification Section */}
        {needsVerification && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Payment Verification</h3>
            
            {!showVerificationForm && !showRejectionForm && (
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowVerificationForm(true);
                    setShowRejectionForm(false);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Payment
                </Button>
                <Button
                  onClick={() => {
                    setShowRejectionForm(true);
                    setShowVerificationForm(false);
                  }}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Payment
                </Button>
              </div>
            )}

            {/* Verification Form */}
            {showVerificationForm && (
              <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Label htmlFor="payment-note">Verification Note (Required)</Label>
                <Textarea
                  id="payment-note"
                  placeholder="Enter verification details (e.g., 'Payment confirmed via M-Pesa ref: ABC123XYZ on 2024-01-15')"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  rows={3}
                  className="bg-white"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleVerifyPayment}
                    disabled={isVerifying || !paymentNote.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isVerifying ? "Verifying..." : "Confirm Verification"}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowVerificationForm(false);
                      setPaymentNote("");
                    }}
                    variant="outline"
                    disabled={isVerifying}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Rejection Form */}
            {showRejectionForm && (
              <div className="space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <Label htmlFor="rejection-reason">Rejection Reason (Required)</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Enter reason for rejection (e.g., 'Payment not received', 'Incorrect amount', etc.)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="bg-white"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleRejectPayment}
                    disabled={isRejecting || !rejectionReason.trim()}
                    variant="destructive"
                  >
                    {isRejecting ? "Rejecting..." : "Confirm Rejection"}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRejectionForm(false);
                      setRejectionReason("");
                    }}
                    variant="outline"
                    disabled={isRejecting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {needsVerification && <Separator />}

        {/* Order Details */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Order Details</div>
            <ul className="grid gap-3">
              {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
                ? orderDetails?.cartItems.map((item, index) => (
                    <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                      <span className="font-semibold">KSh {item.price}</span>
                    </li>
                  ))
                : null}
            </ul>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Shipping Info</div>
            <div className="grid gap-0.5 text-muted-foreground bg-gray-50 p-3 rounded">
              <span className="font-semibold text-gray-900">{user.userName}</span>
              <span>{orderDetails?.addressInfo?.address}</span>
              <span>{orderDetails?.addressInfo?.city}</span>
              <span>{orderDetails?.addressInfo?.pincode}</span>
              <span>📞 {orderDetails?.addressInfo?.phone}</span>
              {orderDetails?.addressInfo?.notes && (
                <span className="mt-2 italic text-sm">Note: {orderDetails.addressInfo.notes}</span>
              )}
            </div>
          </div>
        </div>

        {/* Status Update Form (only show if not pending verification) */}
        {!needsVerification && (
          <div>
            <CommonForm
              formControls={[
                {
                  label: "Order Status",
                  name: "status",
                  componentType: "select",
                  options: [
                    { id: "pending", label: "Pending" },
                    { id: "inProcess", label: "In Process" },
                    { id: "inShipping", label: "In Shipping" },
                    { id: "delivered", label: "Delivered" },
                    { id: "rejected", label: "Rejected" },
                  ],
                },
              ]}
              formData={formData}
              setFormData={setFormData}
              buttonText={"Update Order Status"}
              onSubmit={handleUpdateStatus}
            />
          </div>
        )}
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;