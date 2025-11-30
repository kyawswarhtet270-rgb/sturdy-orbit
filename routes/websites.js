const express = require("express");
const { read, write } = require("../db/utils/dbutils");
const { requireAuth, requireAdmin } = require("../db/middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  const content = await read("website_content.json");
  res.json(content);
});

router.put("/", requireAuth, requireAdmin, async (req, res) => {
  await write("website_content.json", req.body);
  res.json({ ok: true });
});

module.exports = router;

