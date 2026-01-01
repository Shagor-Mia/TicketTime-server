const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const verifyFirebaseToken = require("../middlewares/verifyFirebaseToken");

const verifyAdmin = require("../middlewares/verifyAdmin");

router.post("/", userController.createUser);
router.get("/", verifyFirebaseToken, verifyAdmin, userController.getUsers);
router.get("/role/:email", verifyFirebaseToken, userController.getUserRole);
router.patch("/profile", verifyFirebaseToken, userController.updateProfile);
router.patch(
  "/role/:id",
  verifyFirebaseToken,
  verifyAdmin,
  userController.updateUserRole
);

module.exports = router;
