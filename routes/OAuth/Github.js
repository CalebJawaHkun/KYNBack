const axios = require('axios')
const { v4: uuid4 } = require('uuid')
const { redisClient } = require('../../Settings/DB_API.js')
const { exists, setSession, logSes } = require('../signcommon.js')

module.exports = exp => {
    const router = exp.Router()

    const ghAuthEP = 'https://github.com/login/oauth/authorize'
    const ghTokenEP = 'https://github.com/login/oauth/access_token'
    const ghUserEP = 'https://api.github.com/user'
    const ghEmailEP = 'https://api.github.com/user/emails'

    const client_id = process.env.GITHUB_CLIENT_ID
    const client_secret = process.env.GITHUB_CLIENT_SECRET
    const redirect_uri = process.env.GITHUB_REDIRECT_URI
    const client_url = process.env.CLIENT_URL

    // Redirect user to GitHub OAuth
    router.get('/auth/github', (req, res) => {

        const oauthUrl = `${ghAuthEP}?${new URLSearchParams({
            client_id,
            redirect_uri,
            scope: 'read:user user:email'
        }).toString()}`

        return res.redirect(oauthUrl)
    })

    // GitHub OAuth Callback
    router.get('/auth/github/callback', async (req, res) => {

        const back = () => res.redirect(client_url)

        try {

            const { code, error } = req.query

            if (error) {
                console.warn('GitHub OAuth Denied:', error)
                return back()
            }

            // Exchange authorization code for access token
            const tokenRes = await axios.post(
                ghTokenEP,
                {
                    client_id,
                    client_secret,
                    code,
                    redirect_uri
                },
                {
                    headers: {
                        Accept: 'application/json'
                    }
                }
            )

            const { access_token } = tokenRes.data

            // Fetch GitHub profile
            const userRes = await axios.get(
                ghUserEP,
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                }
            )

            const github = userRes.data

            // Fetch primary email
            const emailRes = await axios.get(
                ghEmailEP,
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                }
            )

            const primaryEmail = emailRes.data.find(
                email => email.primary && email.verified
            )

            if (!primaryEmail) {
                throw new Error('No verified primary email found.')
            }

            const email = primaryEmail.email
            const name = github.name || github.login
            const picture = github.avatar_url

            // Redis Keys
            const localKey = `user:local:${email}`
            const githubKey = `user:github:${email}`

            // Existing account?
            const localExist = await exists(redisClient, localKey)
            const githubExist = await exists(redisClient, githubKey)

            let userId

            if (githubExist) {

                const userData = await redisClient.hGetAll(githubKey)
                userId = userData.userId

            } else {

                userId = uuid4()

                await redisClient.hSet(githubKey, {
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
                'github'
            )

            logSes(req)

            return back()

        } catch (err) {

            console.error('GitHub OAuth Callback Error:', err)

            return res.status(500).json({
                message: 'OAuth Process Failed!'
            })
        }

    })

    return router
}