const express = require("express");
const { read, write } = require("../db/utils/dbutils");
const { requireAuth, requireAdmin } = require("../db/middleware/auth");

const router = express.Router();

router.get("/logs", requireAuth, requireAdmin, async (req, res) => {
  const logs = await read("logs.json");
  res.json(logs);
});

router.post("/flag", async (req, res) => {
  const logs = await read("logs.json");
  logs.push({ type: "security", payload: req.body, at: new Date().toISOString() });
  await write("logs.json", logs);
  res.json({ ok: true });
});

module.exports = router;

