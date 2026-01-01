const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* -------------------- Middlewares -------------------- */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      process.env.CLIENT_URL,
    ],
    credentials: true,
  })
);

app.use(express.json());

/* -------------------- Routes -------------------- */
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/vendors", require("./routes/vendor.routes"));
app.use("/api/tickets", require("./routes/ticket.routes"));
app.use("/api/bookings", require("./routes/booking.routes"));
app.use("/api/payments", require("./routes/payment.routes"));
app.use("/api/admin", require("./routes/admin.routes"));

/* -------------------- Health Check -------------------- */
app.get("/", (req, res) => {
  res.send({
    status: "OK",
    message: "Ticket Booking API is running ",
    timestamp: new Date(),
  });
});

/* -------------------- 404 Handler -------------------- */
app.use((req, res) => {
  res.status(404).send({ message: "Route not found" });
});

/* -------------------- Global Error Handler -------------------- */
app.use((err, req, res, next) => {
  console.error(" Error:", err.stack);
  res.status(500).send({
    message: "Internal Server Error",
    error: err.message,
  });
});

module.exports = app;
