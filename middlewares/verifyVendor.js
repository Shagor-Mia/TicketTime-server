const userCollection = require("../models/user.model");

const verifyVendor = async (req, res, next) => {
  try {
    const users = await userCollection();
    const user = await users.findOne({ email: req.decoded_email });

    if (!user || user.role !== "vendor") {
      return res.status(403).send({ message: "Vendor access required" });
    }

    next();
  } catch (error) {
    res.status(500).send({ message: "Vendor verification failed" });
  }
};

module.exports = verifyVendor;
