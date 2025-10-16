const logger = require('morgan')
const cookieParser = require('cookie-parser')
const exp = require('express')
const session = require('express-session')
const { RedisStore } = require('connect-redis')
const { createClient } = require('redis')

const app = exp()

// middlewares setup
app.use(logger('dev'))
app.use(cookieParser())
app.use(exp.json())
app.use(exp.urlencoded({extended: true}))

// Redis client setup
const re_client = createClient()
re_client.connect().catch(console.error)
re_client.on('error', err => console.error('Redis Cleint Error: ', err))

// session setup
app.use(session({
    store: new RedisStore({client: re_client}),
    secret: 'super-ecret', 
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 10 * 60 * 1000
    }
}))

// routes for CRUD
const route = '/redis_crud'
app.use(route, (req, res, next) => {
    if(!req.session.on) req.session.on = true
    next()
})
app.get(route + '/:key', async (req, res) => { 
    const key = req.params.key
    const value = await re_client.get(key)
    if(!value) return res.send(`The value with key: ${key} does not exit.`)
    res.send(`${key} : ${value}`)
})

app.route(route)
    .post(async (req, res) => {
        const { key, value } = req.body
        let result = await re_client.set(key, value)

        res.send(`New value with key: ${key} is set.`)
    })
    .put(async (req, res) => {
        const { key, value } = req.body
        if(!await re_client.get(key)) return res.send('The key does not exit to update!')

        let result = await re_client.set(key, value)

        res.send(`New value with key: ${key} is updated.`)
    })

app.delete(route, async (req, res) => {
    let deleted = await re_client.del(req.query.key)
    if(!deleted) return res.send(`Item with key: ${req.query.key} does not exit to delete!`)

    res.send(`Item with key: ${req.query.key} has been deleted!`)
})

module.exports = app


