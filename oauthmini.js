const exp = require('express')
const session = require('express-session')
const passport = require('passport')
const {RedisStore} = require('connect-redis')
const {createClient} = require('redis')
const dotenv = require('dotenv')
const { Strategy : GoogleStrategy } = require('passport-google-oauth20')

dotenv.config()
const app = exp()

const redisClient = createClient()
redisClient.connect().catch(console.error)
redisClient.on('Error', () => console.log(`Redis Client connection Error!`))


app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: 'Super-secret-spooky-key',
    resave: false,
    saveUninitilized: false,
    cookie: {
        maxAge: 5 * 60 * 1000,
        secure: false
    }
})) 

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((obj, done) => done(null, obj))

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
    return done(null, {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        picture: profile.photos[0].value
    })
}))

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}))
app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/auth/fail',
        session: true
    }),
    (req, res) => {
        res.send(`<h2> Welcome ${req.user.name} </h2> <img src="${req.user.picture}" width="100"/>`)
    }
)
app.get('/auth/user', (req, res) => {
    if(req.isAuthenticated()) return res.json(req.user)
    res.status(401).send('Not logged In')
})
app.get('/auth/logout', (req, res) => {
    req.logout(err => {
        if(err) return res.status(500).send('Logout Error!')
        res.send('Logged Out!')
    })
})

module.exports = app