const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
app.post("/create-checkout-session", async (req, res) => {
  const { items } = req.body; // Array of items (each with id, name, price, and quantity)
  const ids = (items || []).map((item) => item.id).join(","); // Joining IDs with a comma
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price, // Price in cents
        },
        quantity: item.quantity,
      })),
      mode: "payment", // 'payment' for one-time payments, 'subscription' for recurring
      success_url: `${process.env.FRONTEND_BASE_URL}/success?invoideIds=${ids}`, // create a success page and do the operation after successfull payment
      cancel_url: `${process.env.FRONTEND_BASE_URL}/cancel`,
    });

    // test card number - 4000 0035 6000 0008

    res.json({ id: session.id });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
