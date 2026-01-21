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

// redis client
const redisClient = new redis(process.env.REDIS_URL);
// middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req,res,next) =>{
  logger.info(`Recived at ${req.method} Request to ${req.url}`);
  logger.info(`Request body ${req.body}`);
});
