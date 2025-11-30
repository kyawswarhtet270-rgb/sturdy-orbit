// Core dependencies
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

// Utils & middleware
const logger = require("./db/utils/logger"); // make sure logger.js exists
const rateLimiter = require("./db/middleware/rate");
const authMiddleware = require("./db/middleware/auth");

// Initialize app
const app = express();

// Global middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(rateLimiter);

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/products", require("./routes/products"));
app.use("/categories", require("./routes/categories"));
app.use("/customers", require("./routes/customers"));
app.use("/orders", require("./routes/orders"));
app.use("/wallet", require("./routes/wallet"));
app.use("/websites", require("./routes/websites"));
app.use("/notifications", require("./routes/notifications"));
app.use("/security", require("./routes/security"));

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    console.log(`Server running on port ${PORT}`);
});




