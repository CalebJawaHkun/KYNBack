module.exports = {
    response: (success, message) => ({success, message}),
    exists: async (client, email) => client.exists(`user:${email}`),
    logSes: (req) => {
        const ses = req.session
        console.log(
            `User Id: ${ses.userId},
             Auth Type: ${ses.authType},
             `
        )
    }
}