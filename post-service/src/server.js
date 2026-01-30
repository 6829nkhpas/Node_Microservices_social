const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const dotenv = require('dotenv');
const postRoutes = require('./routes/postRoutes.js');
const errorhandler = require('./middlewares/errorhandler.js');
const logger = require('./utils/logger.js');
const redis = require('ioredis');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    logger.info("Connected to MongoDB successfully");
})
.catch((err) => {
    logger.error("Error connecting to MongoDB", err);
});

const redisClient = new redis(process.env.REDIS_URL);
redisClient.on('connect', () => {
    logger.info("Connected to Redis successfully");
});
redisClient.on('error', (err) => {
    logger.error("Error connecting to Redis", err);
});

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

app.use('/api/post',(req,res,next)=>{
    req.redisClient = redisClient;
    next();
}, postRoutes);

// implement ratelimiting in sensative routes


app.use(errorhandler);




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Post Service running on port ${PORT}`);
});
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection", {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason?.stack,
  });
  process.exit(1);
});
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});