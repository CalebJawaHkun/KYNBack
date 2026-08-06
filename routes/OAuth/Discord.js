const axios = require('axios')
const { v4: uuid4 } = require('uuid')
const { redisClient } = require('../../Settings/DB_API.js')
const { exists, setSession, logSes } = require('../signcommon.js')

module.exports = exp => {
    const router = exp.Router()

    const dcAuthEP = 'https://discord.com/oauth2/authorize'
    const dcTokenEP = 'https://discord.com/api/oauth2/token'
    const dcUserEP = 'https://discord.com/api/users/@me'

    const client_id = process.env.DISCORD_CLIENT_ID
    const client_secret = process.env.DISCORD_CLIENT_SECRET
    const redirect_uri = process.env.DISCORD_REDIRECT_URI
    const client_url = process.env.CLIENT_URL

    // Redirect user to Discord OAuth
    router.get('/auth/discord', (req, res) => {

        const oauthUrl = `${dcAuthEP}?${new URLSearchParams({
            client_id,
            redirect_uri,
            response_type: 'code',
            scope: 'identify email'
        }).toString()}`

        return res.redirect(oauthUrl)
    })

    // Discord OAuth Callback
    router.get('/auth/discord/callback', async (req, res) => {

        const back = () => res.redirect(client_url)

        try {

            const { code, error } = req.query

            if (error) {
                console.warn('Discord OAuth Denied:', error)
                return back()
            }

            // Exchange authorization code for access token
            const tokenRes = await axios.post(
                dcTokenEP,
                new URLSearchParams({
                    client_id,
                    client_secret,
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            )

            const { access_token } = tokenRes.data

            // Fetch Discord user
            const userRes = await axios.get(
                dcUserEP,
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                }
            )

            const discord = userRes.data

            const email = discord.email
            const name = discord.global_name || discord.username

            const picture = discord.avatar
                ? `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png`
                : null

            // Redis Keys
            const localKey = `user:local:${email}`
            const discordKey = `user:discord:${email}`

            // Existing account?
            const localExist = await exists(redisClient, localKey)
            const discordExist = await exists(redisClient, discordKey)

            let userId

            if (discordExist) {

                const userData = await redisClient.hGetAll(discordKey)
                userId = userData.userId

            } else {

                userId = uuid4()

                await redisClient.hSet(discordKey, {
                    userId,
                    username: name,
                    email,
                    picture
                })

            }
            
            if (localExist) {

                console.log(`[ALERT]: Email: ${localKey} has been registered locally.`)

            } 

            const token = {
                accessToken: access_token.slice(0, 40).concat('...'),
                tokenType: 'Bearer Token'
            }

            const oauthDat = {
                message: token
                    ? 'Client is authenticated via OAuth'
                    : 'Client is authenticated locally. No Token found!',
                token
            }

            req.session.oauthDat = oauthDat

            await setSession(
                req,
                userId,
                name,
                email,
                picture,
                'discord'
            )

            logSes(req)

            return back()

        } catch (err) {

            console.error('Discord OAuth Callback Error:', err)

            return res.status(500).json({
                message: 'OAuth Process Failed!'
            })

        }

    })

    return router
}