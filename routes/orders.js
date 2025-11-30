const express = require("express");
const { read, write } = require("../db/utils/dbutils");
const paymentCfg = require("../config/paymentConfig.json");
const Stripe = require("stripe");
const stripe = new Stripe(paymentCfg.stripeSecretKey);
const makeId = require("../db/utils/id");
const { requireAuth } = require("../db/middleware/auth");

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  const { items } = req.body; // [{ productId, quantity }]
  const products = await read("products.json");
  const orders = await read("orders.json");

  const lineItems = items.map(i => {
    const p = products.find(pr => pr.id === i.productId);
    if (!p) throw new Error("Product not found: " + i.productId);
    return { productId: p.id, name: p.name, priceCents: p.priceCents, quantity: i.quantity };
  });

  const totalCents = lineItems.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: paymentCfg.currency,
    automatic_payment_methods: { enabled: true }
  });

  const order = {
    id: makeId(),
    userId: req.user.sub,
    items: lineItems,
    totalCents,
    status: "pending",
    paymentIntentId: paymentIntent.id,
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  await write("orders.json", orders);

  res.json({ orderId: order.id, clientSecret: paymentIntent.client_secret });
});

router.post("/:id/confirm", requireAuth, async (req, res) => {
  const orders = await read("orders.json");
  const order = orders.find(o => o.id === req.params.id && o.userId === req.user.sub);
  if (!order) return res.status(404).json({ error: "Order not found" });

  const intent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
  if (intent.status !== "succeeded") return res.status(400).json({ error: "Payment not completed" });

  order.status = "paid";
  order.paidAt = new Date().toISOString();

  const products = await read("products.json");
  order.items.forEach(i => {
    const idx = products.findIndex(p => p.id === i.productId);
    if (idx !== -1) products[idx].stock = Math.max(0, (products[idx].stock || 0) - i.quantity);
  });

  await write("products.json", products);
  await write("orders.json", orders);

  res.json({ ok: true });
});

router.get("/:id", requireAuth, async (req, res) => {
  const orders = await read("orders.json");
  const order = orders.find(o => o.id === req.params.id && o.userId === req.user.sub);
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(order);
});

module.exports = router;

