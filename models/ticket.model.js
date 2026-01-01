const connectDB = require("../config/db");

const ticketCollection = async () => {
  const db = await connectDB();
  return db.collection("tickets");
};

module.exports = ticketCollection;
