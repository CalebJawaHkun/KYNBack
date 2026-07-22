const session = require('express-session')
const redisClient = require('./DB_API')
const {RedisStore} = require('connect-redis')

module.exports = exp => {
    const router = exp.Router()

    const redisStore = new RedisStore({client: redisClient})

    router.use(
        session({
            store: redisStore,
            secret: process.env.SESSION_SECRET || 'supersecret',
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: false,
                maxAge: 1000 * 60 * 60 * 24,
            }
        })
    )

    console.log(`Session and DB has been mounted.`)

    return router
}