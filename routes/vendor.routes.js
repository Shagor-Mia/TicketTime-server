const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendor.controller");

const verifyAdmin = require("../middlewares/verifyAdmin");
const verifyFirebaseToken = require("../middlewares/verifyFirebaseToken");

router.get("/", verifyFirebaseToken, verifyAdmin, vendorController.getVendors);
router.get("/me", verifyFirebaseToken, vendorController.getMyVendorProfile);
router.post("/request", verifyFirebaseToken, vendorController.requestVendor);
router.patch(
  "/status/:id",
  verifyFirebaseToken,
  verifyAdmin,
  vendorController.updateVendorStatus
);
router.delete(
  "/:id",
  verifyFirebaseToken,
  verifyAdmin,
  vendorController.deleteVendor
);

module.exports = router;
