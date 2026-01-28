require("dotenv").config();
const logger = require("../src/utils/logger");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require("ioredis");

const router = require("../src/routes/identityRoutes.js");
const errorhandler = require("../src/middleware/errorhandler.js");

const PORT = process.env.PORT || 3001;
const app = express();

/* ==============================
   MongoDB Connection
================================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => logger.info("MongoDB connected successfully"))
  .catch((err) => logger.error("MongoDB connection failed", err));

/* ==============================
   Redis Client
================================ */
const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on("connect", () => {
  logger.info("Redis connected");
});

redisClient.on("error", (err) => {
  logger.error("Redis error", err);
});

/* ==============================
   Global Middleware
================================ */
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  next();
});

/* ==============================
   Rate Limiting (rate-limiter-flexible ONLY)
================================ */

/**
 * Global API limiter
 * Example: 100 requests per minute per IP
 */
const apiLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "api",
  points: 100,
  duration: 60, // seconds
});

app.use("/api", async (req, res, next) => {
  try {
    await apiLimiter.consume(req.ip);
    next();
  } catch {
    logger.warn("API rate limit exceeded", { ip: req.ip });
    res.status(429).json({ error: "Too many requests" });
  }
});

/**
 * Sensitive auth limiter (login/register)
 * Example: 5 attempts per 15 minutes per IP
 */
const authLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "auth",
  points: 15,
  duration: 15 * 60, // seconds
});

const authRateLimitMiddleware = async (req, res, next) => {
  try {
    await authLimiter.consume(req.ip);
    next();
  } catch {
    logger.warn("Auth rate limit exceeded", { ip: req.ip });
    res.status(429).json({ error: "Too many authentication attempts" });
  }
};

/* ==============================
   Routes
================================ */
app.use("/api/auth/register", authRateLimitMiddleware);
app.use("/api/auth/loginuser", authRateLimitMiddleware);
app.use("/api/auth/refresh-token", authRateLimitMiddleware);  
app.use("/api/auth/logout", authRateLimitMiddleware);

app.use("/api/auth", router);

/* ==============================
   Error Handler
================================ */
app.use(errorhandler);

/* ==============================
   Server Start
================================ */
app.listen(PORT, () => {
  logger.info(`Server is listening on port ${PORT}`);
});

/* ==============================
   Unhandled Promise Rejection
================================ */
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection", {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason?.stack,
  });
  process.exit(1);
});
