// client/src/components/admin-view/orders.jsx

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersForAdmin, getOrderDetailsForAdmin, resetOrderDetails } from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";
import { Eye, Truck, Package, CheckCircle, XCircle, Clock } from "lucide-react";

const STATUS_CONFIG = {
  confirmed:    { color: "bg-green-500",  icon: <CheckCircle className="w-3 h-3" />, label: "Confirmed" },
  inProcess:    { color: "bg-blue-500",   icon: <Package className="w-3 h-3" />,     label: "Processing" },
  inShipping:   { color: "bg-purple-500", icon: <Truck className="w-3 h-3" />,       label: "Dispatched" },
  delivered:    { color: "bg-emerald-600",icon: <CheckCircle className="w-3 h-3" />, label: "Delivered" },
  cancelled:    { color: "bg-red-600",    icon: <XCircle className="w-3 h-3" />,     label: "Cancelled" },
  rejected:     { color: "bg-red-600",    icon: <XCircle className="w-3 h-3" />,     label: "Rejected" },
  pending:      { color: "bg-gray-400",   icon: <Clock className="w-3 h-3" />,       label: "Pending" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <Badge className={`${cfg.color} flex items-center gap-1 text-white text-xs w-fit`}>
      {cfg.icon} {cfg.label}
    </Badge>
  );
}

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { orderList, orderDetails } = useSelector(s => s.adminOrder);
  const dispatch = useDispatch();

  useEffect(() => { dispatch(getAllOrdersForAdmin()); }, [dispatch]);
  useEffect(() => { if (orderDetails !== null) setOpenDetailsDialog(true); }, [orderDetails]);

  // Group: dispatched / active / completed
  const dispatched = orderList?.filter(o => o.orderStatus === "inShipping") || [];
  const active = orderList?.filter(o => ["confirmed", "inProcess"].includes(o.orderStatus)) || [];
  const completed = orderList?.filter(o => ["delivered", "cancelled", "rejected", "pending"].includes(o.orderStatus)) || [];

  const OrderRow = ({ order, btnLabel = "View", btnVariant = "outline" }) => (
    <TableRow key={order._id}>
      <TableCell className="font-mono text-xs">{order._id?.slice(-8)}</TableCell>
      <TableCell className="text-sm">{order.orderDate?.split("T")[0]}</TableCell>
      <TableCell><StatusBadge status={order.orderStatus} /></TableCell>
      <TableCell>
        <Badge className={order.paymentStatus === "paid" ? "bg-green-500 text-white" : "bg-amber-500 text-white"}>
          {order.paymentStatus === "paid" ? "✅ Paid" : "⏳ COD"}
        </Badge>
      </TableCell>
      <TableCell className="font-semibold">KSh {order.totalAmount}</TableCell>
      <TableCell>
        <Dialog
          open={openDetailsDialog}
          onOpenChange={() => { setOpenDetailsDialog(false); dispatch(resetOrderDetails()); }}
        >
          <Button onClick={() => dispatch(getOrderDetailsForAdmin(order._id))} size="sm" variant={btnVariant}>
            <Eye className="w-3.5 h-3.5 mr-1" /> {btnLabel}
          </Button>
          <AdminOrderDetailsView orderDetails={orderDetails} />
        </Dialog>
      </TableCell>
    </TableRow>
  );

  const OrderTable = ({ orders, emptyMsg = "No orders" }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Total</TableHead>
          <TableHead><span className="sr-only">Actions</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length > 0
          ? orders.map(o => <OrderRow key={o._id} order={o} />)
          : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-400">{emptyMsg}</TableCell>
            </TableRow>
          )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      {/* Dispatched — needs attention */}
      {dispatched.length > 0 && (
        <Card className="border-purple-300 shadow-md">
          <CardHeader className="bg-purple-50 pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-800 text-base">
              <Truck className="w-5 h-5" /> Out for Delivery ({dispatched.length})
            </CardTitle>
            <p className="text-xs text-purple-600 mt-1">These orders are with the delivery agent. Mark as Delivered once payment is collected.</p>
          </CardHeader>
          <CardContent className="pt-4">
            <OrderTable orders={dispatched} emptyMsg="No dispatched orders" />
          </CardContent>
        </Card>
      )}

      {/* Active orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="w-5 h-5" /> Active Orders ({active.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTable orders={active} emptyMsg="No active orders" />
        </CardContent>
      </Card>

      {/* All other orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-gray-600">Completed / Cancelled ({completed.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTable orders={completed} emptyMsg="No completed orders yet" />
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminOrdersView;