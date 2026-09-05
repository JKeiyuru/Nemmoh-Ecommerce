// server/routes/shop/order-routes.js
const express = require("express");

const {
  createOrder,
  initiatePaystackPayment,
  verifyPaystackPayment,
  getAllOrdersByUser,
  getOrderDetails,
} = require("../../controllers/shop/order-controller");

const router = express.Router();

router.post("/create", createOrder);
router.post("/paystack/initiate", initiatePaystackPayment);
router.post("/paystack/verify", verifyPaystackPayment);
router.get("/list/:userId", getAllOrdersByUser);
router.get("/details/:id", getOrderDetails);

module.exports = router;
