module.exports = {
    response: (success, message) => ({success, message}),
    exists: async (client, email) => client.exists(`user:${email}`),
    logSes: (req) => {
        const ses = req.session
        console.log(`User Id: [${ses.userId}], Auth Type: [${ses.authType}].`)  
    },
    logBody: req => console.log(Object.entries(req.body).length>0 ? `Req Body: ${JSON.stringify(req.body)}`:'No Req Body to log.'),
    setSession: (req, userId, username, email, picture, authType) => {
        req.session.clientData = { userId, username, email, picture, authType }
    },
}