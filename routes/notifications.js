const express = require("express");
const { read, write } = require("../db/utils/dbutils");
const makeId = require("../db/utils/id");
const { requireAuth, requireAdmin } = require("../db/middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const notifications = await read("notifications.json");
  res.json(notifications.filter(n => n.userId === req.user.sub || n.userId === "all"));
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { userId = "all", title, message } = req.body;
  const notifications = await read("notifications.json");
  const n = { id: makeId(), userId, title, message, createdAt: new Date().toISOString() };
  notifications.push(n);
  await write("notifications.json", notifications);
  res.json(n);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const notifications = await read("notifications.json");
  const next = notifications.filter(n => n.id !== req.params.id);
  await write("notifications.json", next);
  res.json({ ok: true });
});

module.exports = router;

