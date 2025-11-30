const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { read, write } = require("../db/utils/dbutils");
const makeId = require("../db/utils/id");
const { validEmail, validPassword } = require("../db/utils/validate");
const security = require("../config/security.json");
const logger = require("../db/utils/logger");
const { requireAuth } = require("../db/middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!validEmail(email) || !validPassword(password))
    return res.status(400).json({ error: "Invalid email or password policy" });

  const users = await read("users.json");
  if (users.find(u => u.email === email))
    return res.status(409).json({ error: "Email already in use" });

  const hash = await bcrypt.hash(password, 10);
  const user = { id: makeId(), email, password: hash, role: "customer", createdAt: new Date().toISOString() };
  users.push(user);
  await write("users.json", users);
  logger.info({ event: "user_register", email });
  const token = jwt.sign({ sub: user.id, role: user.role }, security.jwtSecret, { expiresIn: security.jwtExpires });
  res.json({ token });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const users = await read("users.json");
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    logger.warn({ event: "login_failed", email });
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ sub: user.id, role: user.role }, security.jwtSecret, { expiresIn: security.jwtExpires });
  res.json({ token });
});

router.get("/profile", requireAuth, async (req, res) => {
  const users = await read("users.json");
  const user = users.find(u => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json({ id: user.id, email: user.email, role: user.role, createdAt: user.createdAt });
});

module.exports = router;

