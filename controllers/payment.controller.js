const stripe = require("../config/stripe");
const { ObjectId } = require("mongodb");
const bookingCollection = require("../models/booking.model");
const paymentCollection = require("../models/payment.model");

exports.createCheckoutSession = async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: req.body.userEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(req.body.unitPrice * 100),
          product_data: { name: req.body.ticketTitle },
        },
        quantity: req.body.quantity,
      },
    ],
    mode: "payment",
    metadata: { bookingId: req.body.bookingId },
    success_url: `${process.env.DOMAIN_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.DOMAIN_URL}/my-orders`,
  });

  res.send({ url: session.url });
};

exports.verifyPayment = async (req, res) => {
  const bookings = await bookingCollection();
  const payments = await paymentCollection();

  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

  if (session.payment_status !== "paid")
    return res.status(400).send({ message: "Payment not completed" });

  const bookingId = session.metadata.bookingId;

  await bookings.updateOne(
    { _id: new ObjectId(bookingId) },
    { $set: { status: "paid", transactionId: session.payment_intent } }
  );

  await payments.insertOne({
    bookingId: new ObjectId(bookingId),
    amount: session.amount_total / 100,
    transactionId: session.payment_intent,
    status: "paid",
    paymentDate: new Date(),
  });

  res.send({ success: true });
};

exports.getUserPayments = async (req, res) => {
  const payments = await paymentCollection();
  const result = await payments
    .find({ userEmail: req.decoded_email })
    .toArray();

  res.send(result);
};
