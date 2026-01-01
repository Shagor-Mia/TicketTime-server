const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");
const verifyFirebaseToken = require("../middlewares/verifyFirebaseToken");

const verifyVendor = require("../middlewares/verifyVendor");

router.post("/", verifyFirebaseToken, bookingController.createBooking);
router.get("/me", verifyFirebaseToken, bookingController.getUserBookings);
router.get(
  "/vendor",
  verifyFirebaseToken,
  verifyVendor,
  bookingController.getVendorBookings
);
router.patch(
  "/status/:id",
  verifyFirebaseToken,
  verifyVendor,
  bookingController.updateBookingStatus
);

module.exports = router;
