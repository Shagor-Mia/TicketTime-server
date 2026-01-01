const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_KEY, {
  apiVersion: "2023-10-16", // optional but recommended
});

module.exports = stripe;
