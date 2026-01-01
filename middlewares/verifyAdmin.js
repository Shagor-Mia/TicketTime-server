const userCollection = require("../models/user.model");

const verifyAdmin = async (req, res, next) => {
  try {
    const users = await userCollection();
    const user = await users.findOne({ email: req.decoded_email });

    if (!user || user.role !== "admin") {
      return res.status(403).send({ message: "Admin access required" });
    }

    next();
  } catch (error) {
    res.status(500).send({ message: "Admin verification failed" });
  }
};

module.exports = verifyAdmin;
