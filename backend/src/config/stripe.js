// src/config/stripe.js
import Stripe from "stripe";
import dotenv from "dotenv";

// Make sure env variables are loaded even if this file is imported early
dotenv.config();

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error(
    "❌ STRIPE_SECRET_KEY is not set. Add it to your .env file in backend."
  );
}

const stripe = new Stripe(secretKey, {
  apiVersion: "2024-06-20", // or your chosen version
});

export default stripe;
