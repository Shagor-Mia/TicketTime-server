const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const verifyFirebaseToken = require("../middlewares/verifyFirebaseToken");

const verifyAdmin = require("../middlewares/verifyAdmin");

router.get(
  "/overview",
  verifyFirebaseToken,
  verifyAdmin,
  adminController.getAdminOverview
);

module.exports = router;
