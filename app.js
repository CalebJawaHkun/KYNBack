var exp = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require('dotenv')


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

dotenv.config()
var app = exp();

app.use(SesRedis(exp))
app.use(logger('dev'));
app.use(exp.json());
app.use(exp.urlencoded({ extended: false }));
app.use(cookieParser());


//routes
app.use([
    signup(exp), 
    signin(exp),
    logout(exp)
])
app.use(utils(exp))


module.exports = app;
