const helmet = require('helmet');
const express = require('express');
const proxy = require('express-http-proxy');
const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis');
require('dotenv').config();
const app = express();
const cors = require('cors');
const logger = require('./utils/logger');
const errorhandler = require('./utils/errorHandler');

/* ==============================
   Redis Client
================================ */
const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on('connect', () => {
    logger.info('Redis connected');
});

redisClient.on('error', (err) => {
    logger.error('Redis error', err);
});

const PORT = process.env.PORT || 3000;

// Global Middleware
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
    keyPrefix: 'api',
    points: 100,
    duration: 60,
});

app.use(async (req, res, next) => {
    try {
        await apiLimiter.consume(req.ip);
        next();
    } catch (rejRes) {
        res.status(429).send('Too Many Requests');
    }
});

const proxyOptions ={
    proxyReqPathResolver : (req) =>{
        return req.originalUrl.replace(/^\/v1/,"/api");

    },
     proxyErrorHandler:(err, req, res, next)=>{
        logger.error(`proxy error ${err.message}`);
        res.status(500).json({
            message :"Internal Server Error",
            error:err.message
        })
     }
}

/* ==============================
   Proxy Setup for identity service
================================ */
app.use('/v1/auth', proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator:(proxyReqOpts,srcReq) =>{
        proxyReqOpts.headers["Content-Type"] ="application/json"
        return proxyReqOpts;
    },
    userResDecorator:(proxyRes,proxyResData,req,res) =>{
    logger.info(`Response from Identity Service for ${req.method} ${req.url}: ${proxyRes.statusCode}`);
    return proxyResData;
}})); 

/* ==============================
   Proxy Setup for post service
================================ */
app.use('/v1/posts', proxy(process.env.POST_SERVICE_URL,{
    ...proxyOptions,
    proxyReqOptDecorator:(proxyReqOpts,srcReq) =>{
        proxyReqOpts.headers["Content-Type"] ="application/json"
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userID;

        return proxyReqOpts;
    },
    userResDecorator:(proxyRes,proxyResData,req,res) =>{
    logger.info(`Response from Post Service for ${req.method} ${req.url}: ${proxyRes.statusCode}`);
    return proxyResData;
}}));

app.use(errorhandler);

app.listen(PORT,()=>{
    logger.info("application is Listning on port :",PORT);
    logger.info(`API gateway is Runing on : ${process.env.points}`);
    logger.info(`Identity Service is Runing on : ${process.env.IDENTITY_SERVICE_URL}`);
        logger.info(`Posts Service is Runing on : ${process.env.POST_SERVICE_URL}`);
    logger.info(`Redis is Runing on : ${process.env.REDIS_URL}`);
})

