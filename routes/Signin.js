const bcrypt = require('bcrypt')
const {redisClient} = require('../Settings/DB_API')
const {response, exists, logSes, logBody, setSession, localDat,
    checkPasswordBoundary
} = require('./signcommon')

module.exports = exp => {
    const router = exp.Router()

    router.post('/signin', async (req, res) => {
        logBody(req)
        const { email, password } = req.body

        if(!email || !password) 
            return res.status(400).json(response(false, 'Missing required Fields'))

        const boundresult = checkPasswordBoundary(password, res)
        if(boundresult)
            return res.status(401).json(response(false, boundresult))

        try {
            const key = `user:local:${email}`
            const e = await exists(redisClient, key)
            if(!e) 
                return res.status(404).json(response(false, 'Email not found. Please signup first.'))
            
            const user = await redisClient.hGetAll(`user:local:${email}`)
            const passwordMatch = await bcrypt.compare(password, user.password)

            if(!passwordMatch) 
                return res.status(401).json(response(false, 'Incorrect Password.'))

            // console.log(`User with id: ${user.userId} tried to log in.`)
            
            setSession(req, user.userId, user.username, email, '', 'local')
            
            res.status(200).json(response(true, 'Signin Successful!'))

            logSes(req)
        } catch (err) {
            console.error(err) 
            res.status(500).json(response(false, 'Internal Server Error.'))
        }
    })

    return router
}