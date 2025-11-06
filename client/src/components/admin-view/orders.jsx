// client/src/components/admin-view/orders.jsx
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";
import { CheckCircle, XCircle, Eye, Clock, Package } from "lucide-react";

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { orderList, orderDetails } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetailsForAdmin(getId));
  }

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  const getStatusBadge = (order) => {
    const statusConfig = {
      pending_verification: {
        color: "bg-yellow-500",
        icon: <Clock className="w-3 h-3 mr-1" />,
        label: "Awaiting Verification"
      },
      confirmed: {
        color: "bg-green-500",
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
        label: "Confirmed"
      },
      inProcess: {
        color: "bg-blue-500",
        icon: <Package className="w-3 h-3 mr-1" />,
        label: "Processing"
      },
      inShipping: {
        color: "bg-purple-500",
        icon: <Package className="w-3 h-3 mr-1" />,
        label: "Shipping"
      },
      delivered: {
        color: "bg-gray-500",
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
        label: "Delivered"
      },
      rejected: {
        color: "bg-red-600",
        icon: <XCircle className="w-3 h-3 mr-1" />,
        label: "Rejected"
      },
      cancelled: {
        color: "bg-red-600",
        icon: <XCircle className="w-3 h-3 mr-1" />,
        label: "Cancelled"
      },
      pending: {
        color: "bg-gray-400",
        icon: <Clock className="w-3 h-3 mr-1" />,
        label: "Pending"
      }
    };

    const config = statusConfig[order?.orderStatus] || statusConfig.pending;

    return (
      <Badge className={`${config.color} flex items-center w-fit`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    const statusConfig = {
      awaiting_verification: {
        color: "bg-yellow-500",
        label: "Awaiting Verification"
      },
      paid: {
        color: "bg-green-500",
        label: "Paid"
      },
      pending: {
        color: "bg-gray-400",
        label: "Pending"
      },
      failed: {
        color: "bg-red-600",
        label: "Failed"
      }
    };

    const config = statusConfig[paymentStatus] || statusConfig.pending;

    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  // Separate orders by verification status
  const awaitingVerification = orderList?.filter(
    order => order.orderStatus === "pending_verification"
  ) || [];
  
  const otherOrders = orderList?.filter(
    order => order.orderStatus !== "pending_verification"
  ) || [];

  return (
    <div className="space-y-6">
      {/* Awaiting Verification Section */}
      {awaitingVerification.length > 0 && (
        <Card className="border-yellow-300 shadow-lg">
          <CardHeader className="bg-yellow-50">
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Clock className="w-5 h-5" />
              Awaiting Payment Verification ({awaitingVerification.length})
            </CardTitle>
            <p className="text-sm text-yellow-700 mt-2">
              These orders require manual payment verification. Check if payment was received and verify or reject.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Order Price</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {awaitingVerification.map((orderItem) => (
                  <TableRow key={orderItem._id} className="bg-yellow-50/50">
                    <TableCell className="font-mono text-xs">
                      {orderItem?._id?.slice(-8)}
                    </TableCell>
                    <TableCell>{orderItem?.orderDate.split("T")[0]}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {orderItem?.paymentMethod === "manual_mpesa" ? "Manual M-Pesa" : orderItem?.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getPaymentBadge(orderItem?.paymentStatus)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      KSh {orderItem?.totalAmount}
                    </TableCell>
                    <TableCell>
                      <Dialog
                        open={openDetailsDialog}
                        onOpenChange={() => {
                          setOpenDetailsDialog(false);
                          dispatch(resetOrderDetails());
                        }}
                      >
                        <Button
                          onClick={() => handleFetchOrderDetails(orderItem?._id)}
                          size="sm"
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review & Verify
                        </Button>
                        <AdminOrderDetailsView orderDetails={orderDetails} />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Orders Section */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders ({otherOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Order Price</TableHead>
                <TableHead>
                  <span className="sr-only">Details</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otherOrders && otherOrders.length > 0 ? (
                otherOrders.map((orderItem) => (
                  <TableRow key={orderItem._id}>
                    <TableCell className="font-mono text-xs">
                      {orderItem?._id?.slice(-8)}
                    </TableCell>
                    <TableCell>{orderItem?.orderDate.split("T")[0]}</TableCell>
                    <TableCell>{getStatusBadge(orderItem)}</TableCell>
                    <TableCell>{getPaymentBadge(orderItem?.paymentStatus)}</TableCell>
                    <TableCell className="font-semibold">
                      KSh {orderItem?.totalAmount}
                    </TableCell>
                    <TableCell>
                      <Dialog
                        open={openDetailsDialog}
                        onOpenChange={() => {
                          setOpenDetailsDialog(false);
                          dispatch(resetOrderDetails());
                        }}
                      >
                        <Button
                          onClick={() => handleFetchOrderDetails(orderItem?._id)}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <AdminOrderDetailsView orderDetails={orderDetails} />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminOrdersView;