const { ObjectId } = require("mongodb");
const ticketCollection = require("../models/ticket.model");
const userCollection = require("../models/user.model");

exports.createTicket = async (req, res) => {
  const tickets = await ticketCollection();
  const users = await userCollection();

  const vendor = await users.findOne({ email: req.decoded_email });
  if (!vendor) return res.status(403).send({ message: "Vendor not found" });

  const ticket = {
    ...req.body,
    vendor: { email: vendor.email, name: vendor.displayName },
    verificationStatus: "pending",
    createdAt: new Date(),
  };

  const result = await tickets.insertOne(ticket);
  res.send(result);
};

exports.getApprovedTickets = async (req, res) => {
  const tickets = await ticketCollection();
  const data = await tickets
    .find({ verificationStatus: "approved" })
    .sort({ createdAt: -1 })
    .toArray();

  res.send(data);
};

exports.getVendorTickets = async (req, res) => {
  const tickets = await ticketCollection();
  const data = await tickets
    .find({ "vendor.email": req.decoded_email })
    .toArray();

  res.send(data);
};

exports.updateTicket = async (req, res) => {
  const tickets = await ticketCollection();
  const ticket = await tickets.findOne({ _id: new ObjectId(req.params.id) });

  if (!ticket) return res.status(404).send({ message: "Not found" });
  if (ticket.vendor.email !== req.decoded_email)
    return res.status(403).send({ message: "Forbidden" });

  delete req.body._id;
  delete req.body.vendor;

  await tickets.updateOne(
    { _id: ticket._id },
    { $set: { ...req.body, verificationStatus: "pending" } }
  );

  res.send({ success: true });
};

exports.deleteTicket = async (req, res) => {
  const tickets = await ticketCollection();
  await tickets.deleteOne({ _id: new ObjectId(req.params.id) });
  res.send({ success: true });
};

exports.approveRejectTicket = async (req, res) => {
  const tickets = await ticketCollection();
  const { status } = req.body;

  await tickets.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { verificationStatus: status, verifiedAt: new Date() } }
  );

  res.send({ success: true });
};
