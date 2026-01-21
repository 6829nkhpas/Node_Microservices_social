require("dotenv").config();
const logger = require("../src/utils/logger");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const ratelimitexpress = require("express-rate-limit");
const ratelimitredis = require("rate-limiter-flexible");
const redis = require("ioredis");
const redisStore = require("rate-limit-redis");
const router = require("../src/routes/identityRoutes.js");
const errorhandler = require("../src/middleware/errorhandler.js");

const PORT = process.env.PORT ||  3001;
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
  next();
});
// redis rate limiter

const redisLimiter = new ratelimitredis.RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points:10,
  duration: 1
});
//redis rate limiting middleware
app.use((req,res,next)=>{
  redisLimiter.consume(req.ip)
  .then(()=>next())
  .catch(()=>{
    logger.warn(" redie rate limiting excedded for ip add:",req.ip);
    res.status(429).json({
      error: "Too many requests"
    });
  });
});
// express rate limiter for sensative endpoints

const sensativeRateLimiter = ratelimitexpress({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:100,
  standardHeaders: true,
  legacyHeaders:false,
  handler: (req,res)=>{
    logger.warn("express rate limiting excedded for ip add:",req.ip);
    res.status(429).json({
      error: "Too many requests"
    });
  },
  store: new redisStore({ 
    sendCommand: (...args)=> redisClient.call(...args),
  })
});;

// apply to the sensative endpoints

app.use("/api/auth/register",sensativeRateLimiter);
app.use("/api/auth/login",sensativeRateLimiter);

// routes
app.use("/api/auth", router);

// errorhandler
app.use(errorhandler());
 //listning

 app.listen(PORT,()=>{
  logger.info("server is listening on port",PORT);
 });
 //unhandled promise rejection
 process.on('unhandledRejection',(reason,promise)=>{
  logger.error(`unhandledRejection at: `,promise, "reason:", reason);
 });
 