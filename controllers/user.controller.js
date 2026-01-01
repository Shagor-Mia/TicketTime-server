const { ObjectId } = require("mongodb");
const userCollection = require("../models/user.model");

exports.createUser = async (req, res) => {
  const users = await userCollection();
  const user = req.body;

  user.role = "user";
  user.createdAt = new Date();

  const exists = await users.findOne({ email: user.email });
  if (exists) return res.send({ message: "User already exists" });

  const result = await users.insertOne(user);
  res.send(result);
};

exports.getUsers = async (req, res) => {
  const users = await userCollection();
  const { searchText } = req.query;

  const query = searchText
    ? {
        $or: [
          { displayName: { $regex: searchText, $options: "i" } },
          { email: { $regex: searchText, $options: "i" } },
        ],
      }
    : {};

  const result = await users
    .find(query)
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  res.send(result);
};

exports.getUserRole = async (req, res) => {
  const users = await userCollection();
  const user = await users.findOne({ email: req.params.email });

  if (!user) return res.status(404).send({ message: "User not found" });

  res.send({ role: user.role || "user" });
};

exports.updateProfile = async (req, res) => {
  const users = await userCollection();
  const { email } = req.query;

  if (req.decoded_email !== email)
    return res.status(403).send({ message: "Forbidden" });

  await users.updateOne({ email }, { $set: req.body });
  res.send({ success: true });
};

exports.updateUserRole = async (req, res) => {
  const users = await userCollection();
  const { id } = req.params;

  const result = await users.updateOne(
    { _id: new ObjectId(id) },
    { $set: { role: req.body.role } }
  );

  res.send(result);
};
