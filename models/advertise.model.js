const connectDB = require("../config/db");

const advertiseCollection = async () => {
  const db = await connectDB();
  return db.collection("advertise");
};

module.exports = advertiseCollection;
