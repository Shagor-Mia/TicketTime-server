const connectDB = require("../config/db");

const userCollection = async () => {
  const db = await connectDB();
  return db.collection("users");
};

module.exports = userCollection;
