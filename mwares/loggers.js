function SessionLogger(req, res, next) {
    console.log('Ses Logger: ', JSON.stringify(req.session))
    next()
}

module.exports = {
    SessionLogger
}