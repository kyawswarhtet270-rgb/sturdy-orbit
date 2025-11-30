const express = require("express");
const { read, write } = require("../db/utils/dbutils");
const { requireAuth, requireAdmin } = require("../db/middleware/auth");

const router = express.Router();

router.get("/balance", requireAuth, async (req, res) => {
  const wallets = await read("customer_wallets.json");
  const w = wallets.find(w => w.userId === req.user.sub) || { userId: req.user.sub, balance: 0 };
  res.json(w);
});

router.post("/topup", requireAuth, async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
  const wallets = await read("customer_wallets.json");
  const idx = wallets.findIndex(w => w.userId === req.user.sub);
  if (idx === -1) wallets.push({ userId: req.user.sub, balance: amount });
  else wallets[idx].balance += amount;
  await write("customer_wallets.json", wallets);
  res.json(wallets.find(w => w.userId === req.user.sub));
});

router.post("/transfer-to-owner", requireAuth, requireAdmin, async (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || !amount || amount <= 0) return res.status(400).json({ error: "Invalid payload" });

  const wallets = await read("customer_wallets.json");
  const ow = await read("owner_wallet.json");
  const wIdx = wallets.findIndex(w => w.userId === userId);
  if (wIdx === -1 || wallets[wIdx].balance < amount) return res.status(400).json({ error: "Insufficient funds" });

  wallets[wIdx].balance -= amount;
  ow.balance = (ow.balance || 0) + amount;
  await write("customer_wallets.json", wallets);
  await write("owner_wallet.json", ow);
  res.json({ ok: true, ownerBalance: ow.balance });
});

module.exports = router;

