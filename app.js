var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')
const { createClient } = require('redis')
const { RedisStore } = require('connect-redis')
const session = require('express-session')

const formDatDB = require('./db/demo_formdat_redis')
const realFormDatDB = require('./db/formdat_redis')


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const crud = require('./routes/crud_session')
var app = express();


const redis_cl = createClient()
redis_cl.connect().catch(console.error)


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

app.use(session({
    store: new RedisStore({client: redis_cl}),
    secret: 'secret-key',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 5 * 60 * 1000
    }
}))

/*
app.use(crud(express))
app.use(indexRouter(express))
app.use('/users', usersRouter); 
*/

realFormDatDB(redis_cl, app)

module.exports = app;  