// server/controllers/shop/order-controller.js

const {
  sendOrderConfirmedEmail,
  sendOrderDispatchedEmail,
  sendOrderDeliveredEmail,
} = require("../common/email-controller");
const { initializeTransaction, verifyTransaction } = require("../../helpers/paystack");
const crypto = require("crypto");
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

    // Clear the cart once a COD order has been placed
    if (cartId) {
      await Cart.findByIdAndDelete(cartId).catch(() => {});
    }

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

// ─── Paystack: create a pending order + initialize the transaction ───────────
const initiatePaystackPayment = async (req, res) => {
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

    // Create the order up-front in a pending state; it's confirmed once
    // verifyPaystackPayment confirms the transaction was successful.
    const newOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus: "pending",
      paymentMethod: "paystack",
      paymentStatus: "pending",
      totalAmount,
      subtotalAmount: subtotalAmount || totalAmount - (deliveryFee || 0),
      deliveryAmount: deliveryFee || 0,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    });
    await newOrder.save();

    const reference = `KMTS-${newOrder._id}-${crypto.randomBytes(3).toString("hex")}`;
    newOrder.paymentId = reference;
    await newOrder.save();

    const paystackRes = await initializeTransaction({
      email: user.email,
      amount: totalAmount,
      reference,
      metadata: { orderId: newOrder._id.toString(), userId },
    });

    if (!paystackRes?.status) {
      return res.status(502).json({ success: false, message: "Could not start Paystack transaction" });
    }

    res.status(201).json({
      success: true,
      orderId: newOrder._id,
      reference,
      authorizationUrl: paystackRes.data.authorization_url,
      accessCode: paystackRes.data.access_code,
      publicKey: process.env.PAYSTACK_PUBLIC_KEY,
    });
  } catch (e) {
    console.error("❌ initiatePaystackPayment error:", e.response?.data || e.message);
    res.status(500).json({ success: false, message: "Failed to start Paystack payment" });
  }
};

// ─── Paystack: verify a transaction after the popup/redirect completes ───────
const verifyPaystackPayment = async (req, res) => {
  try {
    const { reference } = req.body;
    if (!reference) return res.status(400).json({ success: false, message: "Reference is required" });

    const order = await Order.findOne({ paymentId: reference });
    if (!order) return res.status(404).json({ success: false, message: "Order not found for this reference" });

    // Idempotency guard — don't double-process an already-paid order
    if (order.paymentStatus === "paid") {
      return res.status(200).json({ success: true, message: "Order already confirmed", orderId: order._id });
    }

    const verifyRes = await verifyTransaction(reference);
    const txn = verifyRes?.data;

    if (!txn || txn.status !== "success") {
      order.paymentStatus = "failed";
      await order.save();
      return res.status(400).json({ success: false, message: "Payment was not successful" });
    }

    // Sanity-check the paid amount matches the order (Paystack amount is in kobo/cents)
    const paidAmount = Number(txn.amount) / 100;
    if (Math.round(paidAmount) < Math.round(order.totalAmount)) {
      console.warn(`⚠️ Paystack amount mismatch for order ${order._id}: expected ${order.totalAmount}, got ${paidAmount}`);
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.orderUpdateDate = new Date();
    await order.save();

    for (const item of order.cartItems) {
      const product = await Product.findById(item.productId);
      if (product && product.totalStock >= item.quantity) {
        product.totalStock -= item.quantity;
        await product.save();
      }
    }

    if (order.cartId) {
      await Cart.findByIdAndDelete(order.cartId).catch(() => {});
    }

    const user = await User.findById(order.userId).catch(() => null);
    if (user) {
      sendOrderConfirmedEmail(user.email, {
        customerName: user.userName,
        orderId: order._id,
        cartItems: order.cartItems,
        subtotalAmount: order.subtotalAmount,
        deliveryFee: order.deliveryAmount,
        totalAmount: order.totalAmount,
        addressInfo: order.addressInfo,
      }).catch(err => console.error("⚠️ Email error:", err.message));
    }

    res.status(200).json({ success: true, message: "Payment verified", orderId: order._id, order });
  } catch (e) {
    console.error("❌ verifyPaystackPayment error:", e.response?.data || e.message);
    res.status(500).json({ success: false, message: "Failed to verify payment" });
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

module.exports = {
  createOrder,
  initiatePaystackPayment,
  verifyPaystackPayment,
  getAllOrdersByUser,
  getOrderDetails,
};