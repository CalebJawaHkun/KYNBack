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

    router.get('/', (req, res) => {
        if(req.session.views) {
            req.session.views++
            res.send(`Welcome back! you have visisted: ${req.session.views} times.`)
        } else {
            req.session.views = 1;
            res.send('Hello new visitor')
        }
    })

    console.log(`Session and DB has been mounted.`)

    return router
}