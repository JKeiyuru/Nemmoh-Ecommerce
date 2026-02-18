// client/src/components/shopping-view/orders.jsx

/* eslint-disable react/jsx-key */
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import ShoppingOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersByUserId, getOrderDetails, resetOrderDetails } from "@/store/shop/order-slice";
import { Badge } from "../ui/badge";
import { Eye, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";

const STATUS_CONFIG = {
  confirmed:    { color: "bg-green-500",  icon: <CheckCircle className="w-3 h-3" />, label: "Confirmed" },
  inProcess:    { color: "bg-blue-500",   icon: <Package className="w-3 h-3" />,     label: "Being Prepared" },
  inShipping:   { color: "bg-purple-500", icon: <Truck className="w-3 h-3" />,       label: "On the Way!" },
  delivered:    { color: "bg-emerald-600",icon: <CheckCircle className="w-3 h-3" />, label: "Delivered" },
  cancelled:    { color: "bg-red-500",    icon: <XCircle className="w-3 h-3" />,     label: "Cancelled" },
  rejected:     { color: "bg-red-500",    icon: <XCircle className="w-3 h-3" />,     label: "Rejected" },
  pending:      { color: "bg-gray-400",   icon: <Clock className="w-3 h-3" />,       label: "Pending" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <Badge className={`${cfg.color} flex items-center gap-1 text-white text-xs`}>
      {cfg.icon} {cfg.label}
    </Badge>
  );
}

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { orderList, orderDetails } = useSelector(s => s.shopOrder);

  useEffect(() => { dispatch(getAllOrdersByUserId(user?.id)); }, [dispatch, user?.id]);
  useEffect(() => { if (orderDetails !== null) setOpenDetailsDialog(true); }, [orderDetails]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orderList?.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No orders yet. Start shopping!</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead><span className="sr-only">Details</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderList?.map(order => (
                <TableRow key={order._id}>
                  <TableCell className="font-mono text-xs">#{order._id?.slice(-8)}</TableCell>
                  <TableCell className="text-sm">{order.orderDate?.split("T")[0]}</TableCell>
                  <TableCell><StatusBadge status={order.orderStatus} /></TableCell>
                  <TableCell className="font-semibold">KSh {order.totalAmount}</TableCell>
                  <TableCell>
                    <Dialog
                      open={openDetailsDialog}
                      onOpenChange={() => { setOpenDetailsDialog(false); dispatch(resetOrderDetails()); }}
                    >
                      <Button size="sm" variant="outline" onClick={() => dispatch(getOrderDetails(order._id))}>
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                      <ShoppingOrderDetailsView orderDetails={orderDetails} />
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default ShoppingOrders;