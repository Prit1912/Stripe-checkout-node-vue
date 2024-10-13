<template>
  <div>
    <h2>Checkout</h2>
    <ul>
      <li v-for="item in items" :key="item.id">
        {{ item.name }} - ₹{{ (item.price / 100).toFixed(2) }} x
        {{ item.quantity }}
      </li>
    </ul>
    <button @click="checkout">Checkout</button>
  </div>
</template>

<script>
import { loadStripe } from "@stripe/stripe-js";
// import axios from "axios";

export default {
  data() {
    return {
      stripe: null,
      items: [
        { id: 1, name: "Product 1", price: 5000, quantity: 1 }, // Example product (price in cents)
        { id: 2, name: "Product 2", price: 2000, quantity: 2 }, // Example product (price in cents)
      ],
    };
  },
  async mounted() {
    this.stripe = await loadStripe(process.env.VUE_APP_STRIPE_API_KEY); // Replace with your Stripe publishable key
  },
  methods: {
    async checkout() {
      try {
        // Call backend API to create a checkout session
        const response = await fetch(
          `${process.env.VUE_APP_BACKEND_BASE_URL}/create-checkout-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              items: this.items,
            }),
          }
        );

        const data = await response.json();

        // Redirect to Stripe Checkout
        const result = await this.stripe.redirectToCheckout({
          sessionId: data.id,
        });
        if (result.error) {
          console.error("Error redirecting to checkout", result.error.message);
        }
      } catch (err) {
        console.error("Checkout failed", err);
      }
    },
  },
};
</script>
<style>
.payment-form {
  max-width: 400px;
  margin: auto;
}
.error-message {
  color: red;
}
.success-message {
  color: green;
}
</style>
