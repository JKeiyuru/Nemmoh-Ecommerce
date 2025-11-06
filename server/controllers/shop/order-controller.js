// server/controllers/shop/order-controller.js
const paypal = require("../../helpers/paypal");
const { createToken, stkPush } = require("../../helpers/mpesa");
const { sendPendingVerificationEmail } = require("../common/email-controller");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const User = require("../../models/User");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body;

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${process.env.CLIENT_URL}/shop/paypal-return`,
        cancel_url: `${process.env.CLIENT_URL}/shop/paypal-cancel`,
      },
      transactions: [
        {
          item_list: {
            items: cartItems.map((item) => ({
              name: item.title,
              sku: item.productId,
              price: item.price.toFixed(2),
              currency: "USD",
              quantity: item.quantity,
            })),
          },
          amount: {
            currency: "USD",
            total: totalAmount.toFixed(2),
          },
          description: "Kenya Magic Toy Shop Purchase",
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: "Error while creating paypal payment",
        });
      } else {
        const newlyCreatedOrder = new Order({
          userId,
          cartId,
          cartItems,
          addressInfo,
          orderStatus,
          paymentMethod,
          paymentStatus,
          totalAmount,
          orderDate,
          orderUpdateDate,
          paymentId,
          payerId,
        });

        await newlyCreatedOrder.save();

        const approvalURL = paymentInfo.links.find(
          (link) => link.rel === "approval_url"
        ).href;

        res.status(201).json({
          success: true,
          approvalURL,
          orderId: newlyCreatedOrder._id,
        });
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

// New: Create order with manual payment verification
const createManualPaymentOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      subtotalAmount,
      deliveryFee,
      cartId,
    } = req.body;

    console.log('📝 Creating manual payment order for user:', userId);

    // Get user details for email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create the order
    const newOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus: "pending_verification",
      paymentMethod: "manual_mpesa",
      paymentStatus: "awaiting_verification",
      totalAmount,
      subtotalAmount: subtotalAmount || totalAmount - (deliveryFee || 0),
      deliveryAmount: deliveryFee || 0,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentVerificationNote: "Awaiting manual payment verification",
    });

    await newOrder.save();
    console.log('✅ Order created:', newOrder._id);

    // Send pending verification email
    try {
      const emailResult = await sendPendingVerificationEmail(user.email, {
        orderId: newOrder._id,
        totalAmount: newOrder.totalAmount,
        customerName: user.userName,
        orderItems: cartItems
      });
      
      if (emailResult.success) {
        console.log('✅ Pending verification email sent to:', user.email);
      } else {
        console.error('⚠️ Failed to send email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('⚠️ Email sending error:', emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully. Payment verification pending.",
      orderId: newOrder._id,
      order: newOrder,
    });

  } catch (error) {
    console.error('❌ Error creating manual payment order:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Not enough stock for this product ${product.title}`,
        });
      }

      product.totalStock -= item.quantity;
      await product.save();
    }

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed",
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

const initiateMpesaPayment = async (req, res) => {
  const { phone, amount, callbackUrl } = req.body;

  try {
    const token = await createToken();
    const stkResponse = await stkPush(token, phone, amount, callbackUrl);

    const newOrder = new Order({
      userId: req.body.userId,
      cartItems: req.body.cartItems,
      addressInfo: req.body.addressInfo,
      paymentMethod: "mpesa",
      paymentStatus: "pending",
      totalAmount: amount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    });

    await newOrder.save();

    res.status(200).json({
      success: true,
      data: stkResponse,
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("M-Pesa payment error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "M-Pesa payment failed" });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId }).sort({ orderDate: -1 });

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

const getOrderDetails = async (req, res) => {
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

module.exports = {
  createOrder,
  createManualPaymentOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
  initiateMpesaPayment,
};