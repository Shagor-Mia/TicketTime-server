const { ObjectId } = require("mongodb");
const vendorCollection = require("../models/vendor.model");
const userCollection = require("../models/user.model");

exports.getVendors = async (req, res) => {
  const vendors = await vendorCollection();
  const result = await vendors.find(req.query).toArray();
  res.send(result);
};

exports.getMyVendorProfile = async (req, res) => {
  const users = await userCollection();
  const user = await users.findOne({ email: req.decoded_email });

  if (!user || user.role !== "vendor")
    return res.status(403).send({ message: "Not a vendor" });

  res.send(user);
};

exports.requestVendor = async (req, res) => {
  const vendors = await vendorCollection();
  const exists = await vendors.findOne({ email: req.decoded_email });

  if (exists) return res.status(409).send({ message: "Already requested" });

  const vendor = {
    ...req.body,
    email: req.decoded_email,
    status: "pending",
    createdAt: new Date(),
  };

  const result = await vendors.insertOne(vendor);
  res.send(result);
};

exports.updateVendorStatus = async (req, res) => {
  const vendors = await vendorCollection();
  const users = await userCollection();
  const { id } = req.params;
  const { status, email } = req.body;

  await vendors.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, workStatus: "ticket available" } }
  );

  if (status === "approved") {
    await users.updateOne({ email }, { $set: { role: "vendor" } });
  }

  res.send({ success: true });
};

exports.deleteVendor = async (req, res) => {
  const vendors = await vendorCollection();
  await vendors.deleteOne({ _id: new ObjectId(req.params.id) });
  res.send({ success: true });
};
