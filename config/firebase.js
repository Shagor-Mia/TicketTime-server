const admin = require("firebase-admin");

// Decode Base64 service account from ENV
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_ADMIN, "base64").toString("utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
