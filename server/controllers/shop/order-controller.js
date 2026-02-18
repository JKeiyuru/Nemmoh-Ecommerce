// server/controllers/shop/order-controller.js

const {
  sendOrderConfirmedEmail,
  sendOrderDispatchedEmail,
  sendOrderDeliveredEmail,
} = require("../common/email-controller");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const User = require("../../models/User");

// ─── Create a Cash-on-Delivery order ─────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartId,
      cartItems,
      addressInfo,
      totalAmount,
      subtotalAmount,
      deliveryFee,
    } = req.body;

    if (!userId || !cartItems || !cartItems.length) {
      return res.status(400).json({ success: false, message: "Missing required order fields" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const newOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus: "confirmed",
      paymentMethod: "cash_on_delivery",
      paymentStatus: "pending",
      totalAmount,
      subtotalAmount: subtotalAmount || totalAmount - (deliveryFee || 0),
      deliveryAmount: deliveryFee || 0,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    });

    await newOrder.save();
    console.log("✅ COD order created:", newOrder._id);

    // Send order confirmation email (non-blocking)
    sendOrderConfirmedEmail(user.email, {
      customerName: user.userName,
      orderId: newOrder._id,
      cartItems,
      subtotalAmount: newOrder.subtotalAmount,
      deliveryFee: newOrder.deliveryAmount,
      totalAmount,
      addressInfo,
    }).catch(err => console.error("⚠️ Email error:", err.message));

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      orderId: newOrder._id,
      order: newOrder,
    });
  } catch (e) {
    console.error("❌ createOrder error:", e);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};

// ─── Legacy: manual M-Pesa (kept, redirected to COD) ─────────────────────────
const createManualPaymentOrder = createOrder;

// ─── Capture PayPal (legacy — kept but not surfaced in UI) ───────────────────
const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    for (const item of order.cartItems) {
      const product = await Product.findById(item.productId);
      if (product) { product.totalStock -= item.quantity; await product.save(); }
    }

    await Cart.findByIdAndDelete(order.cartId);
    await order.save();

    res.status(200).json({ success: true, message: "Order confirmed", data: order });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Error capturing payment" });
  }
};

// ─── Get all orders by user ───────────────────────────────────────────────────
const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ orderDate: -1 });

    if (!orders.length) {
      return res.status(200).json({ success: true, data: [] });
    }

    res.status(200).json({ success: true, data: orders });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// ─── Get single order details ─────────────────────────────────────────────────
const getOrderDetails = async (req, res) => {
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

// ─── M-Pesa STK stub (kept, not surfaced in UI) ───────────────────────────────
const initiateMpesaPayment = async (req, res) => {
  res.status(503).json({ success: false, message: "M-Pesa STK is not currently active. Please use Cash on Delivery." });
};

module.exports = {
  createOrder,
  createManualPaymentOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
  initiateMpesaPayment,
};