function checkBoundary(arg) {
    return arg<8 ? 1:arg>=20 ? 2 : 0
}

function response(success, message) { return ({success, message})}

module.exports = {
    response: response,
    exists: async (client, key) => {
        console.log('Redis Client: ', client)
        console.log('Client Key: ', key)
        return client.exists(key)
    },
    logSes: (req) => {
        const ses = req.session?.clientData
        if(!ses) return console.log('Client Data not yet set up or Session does not exits!')
        console.log(`Session Logger: User Id: [${ses.userId}], Auth Type: [${ses.authType}].`)  
    },
    logBody: req => console.log(Object.entries(req.body).length>0 ? `Req Body: ${JSON.stringify(req.body)}`:'No Req Body to log.'),
    setSession: (req, userId, username, email, picture, authType) => {
        req.session.clientData = { userId, username, email, picture, authType }
    },
    checkUsernameBoundary: (username, res) => {

        const responses = ['Username is less than 8 characters.', 'Username is greater than 19 characters.']
        const arglength = username.length
        const result = checkBoundary(arglength)
        if(result)
            return responses[result - 1]

    },
    checkPasswordBoundary: (password, res) => {
        const responses = ['Password is less than 8 characters.', 'Password is greater than 19 characters.']
        const arglength = password.length
        const result = checkBoundary(arglength)

        if(result) 
            return responses[result - 1]
    }
}