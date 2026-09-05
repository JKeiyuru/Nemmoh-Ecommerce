// server/helpers/paystack.js
const axios = require("axios");

const PAYSTACK_BASE_URL = "https://api.paystack.co";

const paystackClient = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

// Initialize a transaction. Amount must be passed in KES (major units) —
// Paystack expects the smallest currency unit, so we multiply by 100.
const initializeTransaction = async ({ email, amount, reference, metadata = {}, callback_url }) => {
  const response = await paystackClient.post("/transaction/initialize", {
    email,
    amount: Math.round(Number(amount) * 100),
    currency: "KES",
    reference,
    metadata,
    ...(callback_url && { callback_url }),
  });
  return response.data; // { status, message, data: { authorization_url, access_code, reference } }
};

// Verify a transaction by its reference.
const verifyTransaction = async (reference) => {
  const response = await paystackClient.get(`/transaction/verify/${encodeURIComponent(reference)}`);
  return response.data; // { status, message, data: { status: 'success' | 'failed' | ..., amount, ... } }
};

module.exports = { initializeTransaction, verifyTransaction };
