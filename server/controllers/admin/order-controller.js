// server/controllers/admin/order-controller.js

const Order = require("../../models/Order");
const User = require("../../models/User");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const {
  sendOrderDispatchedEmail,
  sendOrderDeliveredEmail,
} = require("../common/email-controller");

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ orderDate: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, data: order });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Error fetching order" });
  }
};

// ─── Update order status + trigger emails + reduce stock when dispatched ──────
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const previousStatus = order.orderStatus;
    order.orderStatus = orderStatus;
    order.orderUpdateDate = new Date();

    // Reduce stock when moving to inProcess (picking + packing stage)
    if (orderStatus === "inProcess" && previousStatus !== "inProcess") {
      for (const item of order.cartItems) {
        const product = await Product.findById(item.productId);
        if (product && product.totalStock >= item.quantity) {
          product.totalStock -= item.quantity;
          await product.save();
        }
      }
      // Clear the cart once the order is being processed
      if (order.cartId) {
        await Cart.findByIdAndDelete(order.cartId).catch(() => {});
      }
    }

    await order.save();

    // Fetch the user for email sending
    const user = await User.findById(order.userId).catch(() => null);

    // Dispatch email when admin marks as "inShipping"
    if (orderStatus === "inShipping" && user) {
      sendOrderDispatchedEmail(user.email, {
        customerName: user.userName,
        orderId: order._id,
        totalAmount: order.totalAmount,
        addressInfo: order.addressInfo,
        estimatedDelivery: "Today or Tomorrow",
      }).catch(err => console.error("⚠️ Dispatch email error:", err.message));
    }

    // Delivered email when admin marks as "delivered"
    if (orderStatus === "delivered" && user) {
      sendOrderDeliveredEmail(user.email, {
        customerName: user.userName,
        orderId: order._id,
        totalAmount: order.totalAmount,
        cartItems: order.cartItems,
      }).catch(err => console.error("⚠️ Delivered email error:", err.message));

      // Mark payment as received for COD
      order.paymentStatus = "paid";
      await order.save();
    }

    res.status(200).json({ success: true, message: "Order status updated successfully!" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Error updating order status" });
  }
};

// ─── Legacy payment verification (kept for backward compat) ───────────────────
const verifyPayment = async (req, res) => {
  res.status(200).json({ success: true, message: "Payment method is now Cash on Delivery — no manual verification needed." });
};

const rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.orderStatus = "cancelled";
    order.paymentVerificationNote = rejectionReason || "Order cancelled by admin";
    await order.save();

    res.status(200).json({ success: true, message: "Order cancelled successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Error cancelling order" });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  verifyPayment,
  rejectPayment,
};