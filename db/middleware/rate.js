const security = require("../../config/security.json");
const buckets = new Map();

module.exports = function rateLimit(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  const windowMs = security.rateLimit.windowMs;
  const max = security.rateLimit.max;
  const bucket = buckets.get(key) || { start: now, count: 0 };
  if (now - bucket.start > windowMs) {
    bucket.start = now; bucket.count = 0;
  }
  bucket.count += 1;
  buckets.set(key, bucket);
  if (bucket.count > max) return res.status(429).json({ error: "Too many requests" });
  next();
};

