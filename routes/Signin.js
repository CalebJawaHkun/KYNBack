const bcrypt = require('bcrypt')
const redisClient = require('../Settings/DB_API')
const {response, exists, logSes} = require('./signcommon')

module.exports = exp => {
    const router = exp.Router()

    router.post('/signin', async (req, res) => {
        const { email, password } = req.body

        if(!email || !password) 
            return res.status(400).json(response(false, 'Missing required Fields'))

        try {

            const e = await exists(redisClient, email)
            if(!e) 
                return res.status(404).json(response(false, 'Email not found. Please signup first.'))
            
            const user = await redisClient.hGetAll(`user:${email}`)
            const passwordMatch = await bcrypt.compare(password, user.password)

            if(!passwordMatch) 
                return res.status(401).json(response(false, 'Incorrect Password.'))

            // console.log(`User with id: ${user.userId} tried to log in.`)
            
            req.session.userId = user.userId
            req.session.authType = 'local'
            res.status(200).json(response(true, 'Signin Successful!'))

            logSes(req)
        } catch (err) {
            console.error(err) 
            res.status(500).json(response(false, 'Internal Server Error.'))
        }
    })

    return router
}