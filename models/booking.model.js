const connectDB = require("../config/db");

const bookingCollection = async () => {
  const db = await connectDB();
  return db.collection("bookings");
};

module.exports = bookingCollection;
