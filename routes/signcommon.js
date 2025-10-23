module.exports = {
    response: (success, message) => ({success, message}),
    exists: async (client, key) => client.exists(key),
    logSes: (req) => {
        const ses = req.session?.clientData
        if(!ses) return console.log('Client Data not yet set up or Session does not exits!')
        console.log(`Session Logger: User Id: [${ses.userId}], Auth Type: [${ses.authType}].`)  
    },
    logBody: req => console.log(Object.entries(req.body).length>0 ? `Req Body: ${JSON.stringify(req.body)}`:'No Req Body to log.'),
    setSession: (req, userId, username, email, picture, authType) => {
        req.session.clientData = { userId, username, email, picture, authType }
    },
}