var exp = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require('dotenv')

dotenv.config()
var app = exp();

const cors = require('cors')
const session = require('express-session')
const {redisClient, connectRedis} = require('./Settings/DB_API')
const {RedisStore} = require('connect-redis')

// Settings
const SesRedis = require('./Settings/SesRedis')
//middlewares
const { SessionLogger } = require('./mwares/loggers')
//Routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const signup = require('./routes/Signup')
const signin = require('./routes/Signin')
const utils = require('./routes/utils')
const logout = require('./routes/logout')
const Google = require('./routes/OAuth/Google')
const GitHub = require('./routes/OAuth/Github')
const Discordd = require('./routes/OAuth/Discord')


app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173' || 'http://localhost:3000',
    credentials: true,
}))

const redisStore = new RedisStore({client: redisClient})
connectRedis()

app.use(
    session({
        name: 'crunchy-cookie',
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
app.use(logger('dev'));
app.use(exp.json());
app.use(exp.urlencoded({ extended: false }));
app.use(cookieParser());



//routes
app.use([
    indexRouter,
    signup(exp), 
    signin(exp),
    logout(exp),
    Google(exp),
    GitHub(exp),
    Discordd(exp),
    utils(exp)
])


module.exports = app;
