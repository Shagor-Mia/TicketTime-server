const userCollection = require("../models/user.model");
const vendorCollection = require("../models/vendor.model");
const ticketCollection = require("../models/ticket.model");

exports.getAdminOverview = async (req, res) => {
  const users = await userCollection();
  const vendors = await vendorCollection();
  const tickets = await ticketCollection();

  const totalUsers = await users.countDocuments();
  const totalVendors = await vendors.countDocuments();
  const totalTickets = await tickets.countDocuments();

  res.send({ totalUsers, totalVendors, totalTickets });
};
