const express = require("express");
const { read, write } = require("../db/utils/dbutils");
const { requireAuth } = require("../db/middleware/auth");

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  const customers = await read("customers.json");
  const me = customers.find(c => c.userId === req.user.sub);
  res.json(me || null);
});

router.post("/me", requireAuth, async (req, res) => {
  const { name, phone, address } = req.body;
  const customers = await read("customers.json");
  const idx = customers.findIndex(c => c.userId === req.user.sub);
  const profile = { userId: req.user.sub, name, phone, address, updatedAt: new Date().toISOString() };
  if (idx === -1) customers.push({ ...profile, createdAt: new Date().toISOString() });
  else customers[idx] = profile;
  await write("customers.json", customers);
  res.json(profile);
});

module.exports = router;

