/*
    Singup
        - duplicate email (email already exists)
    Signin
        - email does not exist (sign up first)
        - incorrect password, 

    Additional Features
        - Password hashing
*/

const bcrypt = require('bcrypt')
const redisClient = require('../Settings/DB_API')
const { v4: uuidv4 } = require('uuid')
const {response, exists, logSes, logBody, setSession, localDat} = require('./signcommon')

module.exports = exp => {
    const router = exp()

    router.post('/signup', async (req, res) => {
        
        logBody(req)
        // console.log(req.session && 'Session exists.')
        const { email, password, username } = req.body

        if(!email || !password || !username ) {
            return res.status(400).json(response(false, 'Missing Required Fields'))
        }

        try {
            // check if user exists

            const e = await exists(redisClient, email)
            if(e) {
                return res.status(409)
                .json(response(false, 'Email already Registered!'))
            }

            // generate dats
            const hashedPw = await bcrypt.hash(password, 10)
            const userId = uuidv4()

            // save to redis
            await redisClient.hSet(`user:${email}`, {
                userId, username, email, password: hashedPw
            })
            setSession(req, userId, username, email, '', 'local')

            res.status(201).json(response(true, 'Signup Successful'))
            
            logSes(req)
        } catch (err) {
            console.error(err)
            res.status(500).json(response(false, 'Internal Server Error.'))
        } 

       
    })

    return router
}