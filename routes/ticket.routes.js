const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticket.controller");
const verifyFirebaseToken = require("../middlewares/verifyFirebaseToken");

const verifyAdmin = require("../middlewares/verifyAdmin");
const verifyVendor = require("../middlewares/verifyVendor");

router.get("/", ticketController.getApprovedTickets);
router.get(
  "/vendor",
  verifyFirebaseToken,
  verifyVendor,
  ticketController.getVendorTickets
);

router.post(
  "/",
  verifyFirebaseToken,
  verifyVendor,
  ticketController.createTicket
);
router.patch(
  "/:id",
  verifyFirebaseToken,
  verifyVendor,
  ticketController.updateTicket
);
router.delete(
  "/:id",
  verifyFirebaseToken,
  verifyVendor,
  ticketController.deleteTicket
);

router.patch(
  "/verify/:id",
  verifyFirebaseToken,
  verifyAdmin,
  ticketController.approveRejectTicket
);

module.exports = router;
