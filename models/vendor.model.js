const connectDB = require("../config/db");

const vendorCollection = async () => {
  const db = await connectDB();
  return db.collection("vendors");
};

module.exports = vendorCollection;
