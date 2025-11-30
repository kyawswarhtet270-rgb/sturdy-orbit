const express = require("express");
const { read, write } = require("../db/utils/dbutils");
const makeId = require("../db/utils/id");
const { requireAuth, requireAdmin } = require("../db/middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  const categories = await read("categories.json");
  res.json(categories);
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });
  const categories = await read("categories.json");
  const cat = { id: makeId(), name, createdAt: new Date().toISOString() };
  categories.push(cat);
  await write("categories.json", categories);
  res.json(cat);
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const categories = await read("categories.json");
  const idx = categories.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  categories[idx] = { ...categories[idx], ...req.body, updatedAt: new Date().toISOString() };
  await write("categories.json", categories);
  res.json(categories[idx]);
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const categories = await read("categories.json");
  const next = categories.filter(c => c.id !== req.params.id);
  await write("categories.json", next);
  res.json({ ok: true });
});

module.exports = router;

