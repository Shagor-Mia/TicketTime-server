const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_KEY);

const app = express();
const port = process.env.PORT || 3000;

const admin = require("firebase-admin");

// firebase adminSDK
const fs = require("fs");
const { count } = require("console");
const { format } = require("path");

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_ADMIN, "base64").toString("utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// trackingId
const generateTrackingId = () => {
  const prefix = "PRCL";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const random = Math.random().toString(36).substring(2, 10).toUpperCase(); // 8-char random

  return `${prefix}-${date}-${random}`;
};

// middlewares
app.use(express.json());
app.use(cors());

const verifyFirebaseToken = async (req, res, next) => {
  // console.log("authorizeToken,", req.headers.authorization);
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({ message: `unauthorized access` });
  }
  try {
    const idToken = token.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    // console.log(`decoded in the token`, decoded);
    req.decoded_email = decoded.email;
  } catch (error) {
    return res.status(401).send({ message: "Invalid or expired token", error });
  }
  next();
};

const uri = process.env.URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const db = client.db("TicketTimeDB");
    const userCollection = db.collection("users");
    const paymentCollection = db.collection("payments");
    const vendorCollection = db.collection("vendors");
    const ticketCollection = db.collection("tickets");

    // user apis
    // middleware for admin access,must be used after verifyToken
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded_email;
      const admin = await userCollection.findOne({ email });
      if (!admin || admin.role !== "admin") {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };
    // middleware for admin access,must be used after verifyToken
    const verifyVendors = async (req, res, next) => {
      const email = req.decoded_email;
      console.log(email);
      const vendor = await userCollection.findOne({ email });
      if (!vendor || vendor.role !== "vendor") {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

    app.get("/users", verifyFirebaseToken, async (req, res) => {
      // console.log(verifyFirebaseToken);
      const searchText = req.query.searchText;
      const query = {};
      if (searchText) {
        query.$or = [
          { displayName: { $regex: searchText, $options: "i" } },
          { email: { $regex: searchText, $options: "i" } },
        ];
      }

      const result = await userCollection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      user.role = "user";
      user.createdAt = new Date();

      const email = user.email;
      const userExist = await userCollection.findOne({ email });
      if (userExist) {
        return res.send({ message: "user already exist!" });
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users/:id", async (req, res) => {});

    app.get("/users/:email/role", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email });
      if (!user) {
        res.status(401).send({ message: "user not found" });
      } else {
        res.send({ role: user?.role || "user" });
      }
    });

    // FLEXIBLE USER PROFILE UPDATE
    app.patch("/users", verifyFirebaseToken, async (req, res) => {
      const { email } = req.query;
      const { displayName, photoURL } = req.body;

      if (!email) return res.status(400).send({ message: "Email is required" });

      try {
        const user = await userCollection.findOne({ email });
        if (!user) return res.status(404).send({ message: "User not found" });
        if (req.decoded_email !== user.email)
          return res.status(403).send({ message: "Forbidden" });

        const updates = {};
        if (displayName) updates.displayName = displayName;
        if (photoURL) updates.photoURL = photoURL;

        if (Object.keys(updates).length > 0) {
          await userCollection.updateOne({ email }, { $set: updates });
        }

        res.send({ message: "Profile updated successfully", updated: updates });
      } catch (err) {
        res.status(500).send({ message: "Update failed", error: err.message });
      }
    });

    // admin patch for role(admin ,user)
    app.patch(
      "/users/:id/role",
      verifyFirebaseToken,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const roleInfo = req.body;
        const query = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            role: roleInfo.role,
          },
        };
        const result = await userCollection.updateOne(query, updateDoc);
        res.send(result);
      }
    );

    // vendor api
    app.get("/vendors", async (req, res) => {
      const { status, location, workStatus } = req.query;
      const query = {};
      if (status) {
        query.status = status;
      }
      if (location) {
        query.location = location;
      }
      if (workStatus) {
        query.workStatus = workStatus;
      }
      const vendor = await vendorCollection.find(query).toArray();
      res.send(vendor);
    });

    // get logged-in vendor (single user)
    app.get("/vendors/me", verifyFirebaseToken, async (req, res) => {
      const email = req.decoded_email;

      // find user from users collection
      const user = await userCollection.findOne({ email });

      // not found or not vendor
      if (!user || user.role !== "vendor") {
        return res.status(403).send({ message: "You are not a vendor" });
      }

      res.send({
        ...user,
      });
    });

    // became vendors
    app.post("/vendors", verifyFirebaseToken, async (req, res) => {
      const vendor = req.body;
      const email = req.decoded_email;
      const alreadyExists = await vendorCollection.findOne({ email });
      if (alreadyExists)
        return res
          .status(409)
          .send({ message: "Already requested, wait for response." });
      vendor.status = "pending";
      vendor.createdAt = new Date();

      const result = await vendorCollection.insertOne(vendor);
      res.send(result);
    });

    // update vendor status,role
    app.patch(
      "/vendors/:id",
      verifyFirebaseToken,
      verifyAdmin,
      async (req, res) => {
        const { status } = req.body;
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            status: status,
            workStatus: "ticket available",
          },
        };
        const result = await vendorCollection.updateOne(query, updateDoc);
        if (status === "approved") {
          const email = req.body.email;
          const userQuery = { email };
          const updateUser = {
            $set: {
              role: "vendor",
            },
          };
          const userResult = await userCollection.updateOne(
            userQuery,
            updateUser
          );
        }
        res.send(result);
      }
    );

    // delete a vendors
    app.delete(
      "/vendors/:id",
      verifyFirebaseToken,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await vendorCollection.deleteOne(query);
        res.send(result);
      }
    );

    // GET approved tickets for users
    app.get("/tickets/approved", async (req, res) => {
      try {
        const tickets = await ticketCollection
          .find({ verificationStatus: "approved" })
          .sort({ createdAt: -1 })
          .toArray();

        res.send(tickets);
      } catch (error) {
        res.status(500).send({
          message: "Failed to fetch approved tickets",
          error: error.message,
        });
      }
    });

    // GET /tickets/:id
    app.get("/ticket/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const ticket = await ticketCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!ticket)
          return res.status(404).send({ message: "Ticket not found" });
        res.send(ticket);
      } catch (error) {
        res
          .status(500)
          .send({ message: "Failed to fetch ticket", error: error.message });
      }
    });

    // Create a new ticket (only for verified vendors)
    app.post(
      "/tickets",
      verifyFirebaseToken,
      verifyVendors,
      async (req, res) => {
        try {
          const ticket = req.body;

          // Get vendor info from decoded email
          const vendor = await userCollection.findOne({
            email: req.decoded_email,
          });

          if (!vendor) {
            return res.status(403).send({ message: "Vendor not found" });
          }

          // Attach vendor info to the ticket
          ticket.vendor = {
            name: vendor.displayName,
            email: vendor.email,
          };

          // Set initial verification status
          ticket.verificationStatus = "pending";
          ticket.createdAt = new Date();

          // Insert ticket into tickets collection
          const result = await ticketCollection.insertOne(ticket);

          res.send(result);
        } catch (err) {
          console.error(err);
          res
            .status(500)
            .send({ message: "Failed to create ticket", error: err.message });
        }
      }
    );

    // GET /tickets/pending for admin
    app.get(
      "/tickets/pending",
      verifyFirebaseToken,
      verifyAdmin,
      async (req, res) => {
        try {
          const tickets = await ticketCollection
            .find({ verificationStatus: "pending" })
            .sort({ createdAt: -1 })
            .toArray();

          res.send(tickets);
        } catch (err) {
          console.error(err);
          res.status(500).send({
            message: "Failed to fetch pending tickets",
            error: err.message,
          });
        }
      }
    );
    //
    app.get("/tickets", verifyFirebaseToken, verifyAdmin, async (req, res) => {
      const tickets = await ticketCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      res.send(tickets);
    });

    // approve / reject ticket (admin only)
    app.patch(
      "/tickets/:id/approve",
      verifyFirebaseToken,
      verifyAdmin,
      async (req, res) => {
        try {
          const { id } = req.params;
          const { status } = req.body;

          if (!["approved", "rejected"].includes(status)) {
            return res.status(400).send({ message: "Invalid status" });
          }

          const result = await ticketCollection.updateOne(
            { _id: new ObjectId(id) },
            {
              $set: {
                verificationStatus: status,
                verifiedAt: new Date(),
              },
            }
          );

          res.send(result);
        } catch (error) {
          res.status(500).send({
            message: "Failed to update ticket status",
            error: error.message,
          });
        }
      }
    );

    // payment related apis

    // stripe integration
    app.post("/payment-checkout-session", async (req, res) => {});

    // verify payment
    app.patch("/payment-success", async (req, res) => {});

    // riders api

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("online ticket booking!");
});

app.listen(port, () => {
  console.log(` app listening on port ${port}`);
});
