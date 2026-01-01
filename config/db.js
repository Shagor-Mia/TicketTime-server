const { MongoClient, ServerApiVersion } = require("mongodb");

const client = new MongoClient(process.env.URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

const connectDB = async () => {
  if (!db) {
    await client.connect();
    db = client.db("TicketTimeDB");
    console.log("MongoDB connected");
  }
  return db;
};

module.exports = connectDB;
