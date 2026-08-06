const axios = require('axios')
const { v4: uuid4 } = require('uuid')
const {redisClient} = require('../../Settings/DB_API.js')
const { exists, setSession, logSes } = require('../signcommon.js')

module.exports = exp => {
    const router = exp.Router()

    const gTokenEP = 'https://oauth2.googleapis.com/token'
    const gUserEP = 'https://www.googleapis.com/oauth2/v2/userinfo'
    const gAuthEP = 'https://accounts.google.com/o/oauth2/v2/auth'
    const client_id = process.env.GOOGLE_CLIENT_ID
    const client_secret = process.env.GOOGLE_CLIENT_SECRET
    const redirect_uri = process.env.GOOGLE_REDIRECT_URI
    const client_url = process.env.CLIENT_URL

    // redirect t4o user OAuth 2.0
    router.get('/auth/google', (req, res) => {
        const oauthUrl = `${gAuthEP}?${new URLSearchParams({
            client_id,
            redirect_uri,
            response_type: 'code',
            scope: 'openid email profile',
            access_type: 'offline', 
            // prompt: 'consent',
        }).toString()}`

        return res.redirect(oauthUrl)
    })

    // Google OAuth Callback handler
    router.get('/auth/google/callback', async (req, res) => {
        const back = () => res.redirect(client_url)

        try {

            const { code, error } = req.query

            // if user dined access
            if(error) {
                console.warn('Google OAuth Denied: ', error)
                return back()
            }

            // Exchange the code for Access Token
            const tokenRes = await axios.post(gTokenEP, {
                code,
                client_id,
                client_secret,
                redirect_uri,
                grant_type: 'authorization_code'
            })

            const { access_token } = tokenRes.data

            // Fetch user info using the access Token
            const userInfoRes = await axios.get(gUserEP, {
                headers: { Authorization: `Bearer ${access_token}` }
            })
            const { email, name, picture } = userInfoRes.data

            // prepare Redis querying
            const localKey = `user:local:${email}`
            const googleKey = `user:google:${email}`

            // checkinng if the account already exits before
            const localExist = await exists(redisClient, localKey)
            const googleExists = await exists(redisClient, googleKey)
            
            let userId
            if(googleExists) {
                const userData = await redisClient.hGetAll(googleKey)
                userId = userData.userId
            } else {
                userId = uuid4()
                await redisClient.hSet(googleKey, {
                    userId,
                    username: name,
                    email,
                    picture
                })
            }

            if(localExist) {
                // alert the user if local exists
                console.log(`[ALERT]: Email: ${localKey} has been registered locally.`)
            }

            const token = {
                accessToken: access_token.slice(0, 40).concat('...'),
                tokenType: 'Bearer Token'
            }
            const oauthDat = {
                message: token ? 'Client is authenticated via OAuth':'Cient is authenticated locally. No Token found!',
                token
            }
            
            // session shinanigans
            req.session.oauthDat = oauthDat
            await setSession(req, userId, name, email, picture, 'google')
            logSes(req)

            return back()

        } catch (err) {
            console.error('Google OAuth Callback Error: ', err)
            return res.status(500).json({message: 'OAuth Process Failed!'})
        }
    })

    return router
}