const express = require("express");
const { read, write } = require("../db/utils/dbutils");
const makeId = require("../db/utils/id");
const { requireAuth, requireAdmin } = require("../db/middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  const products = await read("products.json");
  res.json(products);
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { name, description, priceCents, imageUrl, stock, categoryId } = req.body;
  if (!name || !priceCents) return res.status(400).json({ error: "Missing required fields" });
  const products = await read("products.json");
  const product = { id: makeId(), name, description: description || "", priceCents, imageUrl: imageUrl || "", stock: stock || 0, categoryId: categoryId || null, createdAt: new Date().toISOString() };
  products.push(product);
  await write("products.json", products);
  res.json(product);
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const products = await read("products.json");
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  products[idx] = { ...products[idx], ...req.body, updatedAt: new Date().toISOString() };
  await write("products.json", products);
  res.json(products[idx]);
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const products = await read("products.json");
  const next = products.filter(p => p.id !== req.params.id);
  if (next.length === products.length) return res.status(404).json({ error: "Not found" });
  await write("products.json", next);
  res.json({ ok: true });
});

module.exports = router;

