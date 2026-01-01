const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const verifyFirebaseToken = require("../middlewares/verifyFirebaseToken");

router.post(
  "/create-session",
  verifyFirebaseToken,
  paymentController.createCheckoutSession
);
router.get("/verify", verifyFirebaseToken, paymentController.verifyPayment);
router.get("/me", verifyFirebaseToken, paymentController.getUserPayments);

module.exports = router;
