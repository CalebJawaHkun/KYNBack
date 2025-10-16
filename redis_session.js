const session = require('express-session')
const {RedisStore} = require('connect-redis')
const { createClient } = require('redis')
const express = require('express')
const logger = require('morgan')
const cookieParser = require('cookie-parser')


const app = express()

const redisClient = createClient()
redisClient.connect().catch(console.error)
redisClient.on('error', err => console.error('Redis Client Error: ', err))

// midlewares
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(logger('dev'))

app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: 'super-secret-spooky-scary',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 30
    }
}))

app.post('/redis_set', (req, res) => {
    req.session.name = req.body.name
    res.send('A session should have been created by now.')
})
app.post('/redis_addone', (req, res) => {
    const myses = req.session
    myses.counter = (myses.counter || 0) + 1


    res.status(200).send(`Current Counter: ${myses.counter}`)
})
app.post('/redis_noses', (req, res) => {
    res.send('NO session should have been created.')
})
app.use((req, res, next) => {
    console.log(JSON.stringify(req.session))
    next()
})



module.exports = app