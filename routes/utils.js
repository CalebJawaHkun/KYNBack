module.exports = exp => {
    const router = exp.Router()

    // sends the login status + userData if the client is authenticated.
    router.get('/status', async (req, res) => {

        const defautRes = () => res.status(200).json({loggedIn: false, clientData: null})

        const clientData = req.session.clientData
        if(!clientData) return defautRes()

        const { email, authType, userId } = clientData
        if(!email || !authType || !userId) 
            return defautRes()

        console.log(`Client requested Status. User Id: ${userId}.`)
        res.status(200).json({loggedIn: true, clientData})
        
    })

    return router
}


/*

{
    "loggedIn": true, 
    "clientData":  {
        "userId": "...", 
        "username": "...", 
        "email": "...",
        "picture": "",
        "authType": ""
    }
}
    :
{ "loggedIn":false, clientData: null }

clientData = session.clientData

*/