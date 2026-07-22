const { createClient } = require("redis");

console.log('Redis URL: ', process.env.REDIS_URL)

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
    // console.error("Redis Client Error:", err);
    console.error("Redis Connection Error!")
});

async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log("Redis connected.");
    }
}

module.exports = {
    redisClient,
    connectRedis,
};