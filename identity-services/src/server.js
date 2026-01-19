require("dotenv").config();
const logger = require("../src/utils/logger");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const ratelimit = require("express-rate-limit");
const ratelimitredis = require("rate-limiter-flexible");
const redis = require("ioredis");

const app = express();

//moongodb connection
mongoose
.connect(process.env.MONGO_URI)
.then(() => {
  logger.info("MongoDB connected successfully");
})
.catch((err) => {
  logger.error("MongoDB connection failed", err);
});