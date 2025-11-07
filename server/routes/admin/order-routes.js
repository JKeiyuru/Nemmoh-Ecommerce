// server/routes/admin/order-routes.js
const express = require("express");

const {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  verifyPayment,
  rejectPayment,
} = require("../../controllers/admin/order-controller");

const router = express.Router();

router.get("/get", getAllOrdersOfAllUsers);
router.get("/details/:id", getOrderDetailsForAdmin);
router.put("/update/:id", updateOrderStatus);
router.post("/verify-payment/:id", verifyPayment);  // ✅ ADD THIS
router.post("/reject-payment/:id", rejectPayment);  // ✅ ADD THIS

module.exports = router;