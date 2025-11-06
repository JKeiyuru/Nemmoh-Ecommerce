// server/controllers/admin/order-controller.js
const Order = require("../../models/Order");
const User = require("../../models/User");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const { sendPaymentVerifiedEmail } = require("../common/email-controller");

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ orderDate: -1 });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    await Order.findByIdAndUpdate(id, { orderStatus });

    res.status(200).json({
      success: true,
      message: "Order status is updated successfully!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

// New: Verify payment for manual orders
const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentNote } = req.body;

    console.log('💰 Verifying payment for order:', id);

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    // Get user details for email
    const user = await User.findById(order.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    // Update order status
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentVerificationNote = paymentNote || "Payment verified by admin";
    order.paymentVerifiedAt = new Date();
    order.orderUpdateDate = new Date();

    // Reduce product stock
    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (product && product.totalStock >= item.quantity) {
        product.totalStock -= item.quantity;
        await product.save();
        console.log(`✅ Reduced stock for ${product.title}: ${item.quantity} units`);
      } else {
        console.warn(`⚠️ Insufficient stock for product: ${item.productId}`);
      }
    }

    // Delete cart
    if (order.cartId) {
      await Cart.findByIdAndDelete(order.cartId);
      console.log('🗑️ Cart deleted:', order.cartId);
    }

    await order.save();
    console.log('✅ Order updated successfully');

    // Send payment verified email
    try {
      const emailResult = await sendPaymentVerifiedEmail(user.email, {
        orderId: order._id,
        totalAmount: order.totalAmount,
        customerName: user.userName,
        orderItems: order.cartItems,
        estimatedDelivery: "3-5 business days"
      });
      
      if (emailResult.success) {
        console.log('✅ Payment verified email sent to:', user.email);
      } else {
        console.error('⚠️ Failed to send email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('⚠️ Email sending error:', emailError);
      // Don't fail the verification if email fails
    }

    res.status(200).json({
      success: true,
      message: "Payment verified and order confirmed! Customer has been notified via email.",
      data: order,
    });

  } catch (e) {
    console.error('❌ Error verifying payment:', e);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: e.message,
    });
  }
};

// New: Reject payment for manual orders
const rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    console.log('❌ Rejecting payment for order:', id);

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    // Update order status
    order.paymentStatus = "failed";
    order.orderStatus = "cancelled";
    order.paymentVerificationNote = rejectionReason || "Payment verification failed";
    order.orderUpdateDate = new Date();

    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment rejected and order cancelled",
      data: order,
    });

  } catch (e) {
    console.error('❌ Error rejecting payment:', e);
    res.status(500).json({
      success: false,
      message: "Error rejecting payment",
      error: e.message,
    });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  verifyPayment,
  rejectPayment,
};