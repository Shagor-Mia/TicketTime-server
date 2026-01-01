const { ObjectId } = require("mongodb");
const bookingCollection = require("../models/booking.model");
const ticketCollection = require("../models/ticket.model");

exports.createBooking = async (req, res) => {
  const bookings = await bookingCollection();
  const tickets = await ticketCollection();

  const ticket = await tickets.findOne({
    _id: new ObjectId(req.body.ticketId),
  });

  if (!ticket || ticket.quantity < req.body.quantity)
    return res.status(400).send({ message: "Not enough tickets" });

  const booking = {
    ...req.body,
    userEmail: req.decoded_email,
    status: "pending",
    createdAt: new Date(),
  };

  const result = await bookings.insertOne(booking);

  await tickets.updateOne(
    { _id: ticket._id },
    { $inc: { quantity: -req.body.quantity } }
  );

  res.send({ bookingId: result.insertedId });
};

exports.getUserBookings = async (req, res) => {
  const bookings = await bookingCollection();
  const result = await bookings
    .find({ userEmail: req.decoded_email })
    .sort({ createdAt: -1 })
    .toArray();

  res.send(result);
};

exports.getVendorBookings = async (req, res) => {
  const bookings = await bookingCollection();
  const result = await bookings
    .find({ vendorEmail: req.decoded_email })
    .toArray();

  res.send(result);
};

exports.updateBookingStatus = async (req, res) => {
  const bookings = await bookingCollection();
  const tickets = await ticketCollection();

  const booking = await bookings.findOne({
    _id: new ObjectId(req.params.id),
  });

  if (req.body.status === "rejected") {
    await tickets.updateOne(
      { _id: new ObjectId(booking.ticketId) },
      { $inc: { quantity: booking.quantity } }
    );
  }

  await bookings.updateOne(
    { _id: booking._id },
    { $set: { status: req.body.status } }
  );

  res.send({ success: true });
};
