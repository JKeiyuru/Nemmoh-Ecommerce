// server/routes/shop/order-routes.js
const express = require("express");

const {
  createOrder,
  createManualPaymentOrder,
  getAllOrdersByUser,
  getOrderDetails,
  capturePayment,
  initiateMpesaPayment,
} = require("../../controllers/shop/order-controller");

const router = express.Router();

router.post("/create", createOrder);
router.post("/create-manual", createManualPaymentOrder);
router.post("/capture", capturePayment);
router.post("/mpesa-payment", initiateMpesaPayment);
router.get("/list/:userId", getAllOrdersByUser);
router.get("/details/:id", getOrderDetails);

module.exports = router;