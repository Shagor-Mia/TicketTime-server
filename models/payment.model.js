const connectDB = require("../config/db");

const paymentCollection = async () => {
  const db = await connectDB();
  return db.collection("payments");
};

module.exports = paymentCollection;
