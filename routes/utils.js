module.exports = exp => {
    const router = exp.Router()

    // sends the login status + userData if the client is authenticated.
    router.get('/status', (req, res) => {

        const defautRes = () => res.status(200).json({loggedIn: false, clientData: null})

        const clientData = req.session.clientData
        if(!clientData) return defautRes()

        const { email, authType, userId } = clientData
        if(!email || !authType || !userId) 
            return defautRes()

        const authDat = req.session.clientData
        // console.log(`/status: Auth Dat: ${JSON.stringify(authDat)}.`)
        

        console.log(`Client requested Status. User Id: ${userId}.`)
        res.status(200).json({loggedIn: true, clientData})
        
    })

    router.get('/token', (req, res) => {
        const oauthDat = req.session.oauthDat
        console.log('Auth Data: ', oauthDat)
        res.status(200).json(oauthDat)
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