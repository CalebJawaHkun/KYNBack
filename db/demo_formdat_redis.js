

module.exports = (client, app) => {
    const route = '/db'
    const formatKey = str => 'user:' + str.toLowerCase().replace(/\s/g, '_')

    const j = msg => ({ msg })

    // middlewares
    const middleWares = {
        checkifAlreadyExists: async (req, res, next) => {
            const { username }  = req.body
            const userKey = formatKey(username) 
            
            const exits = await client.exists(userKey)
            if(exits) return res.status(409).json(j('User name Already exits!'))

            next()
        },
        checkIfAccountExists: async (req, res, next) => {
            const { email } = req.body
            const emKey = `email:${email}`

            if(!await client.exists(emKey)) return res.status(404).json(j('Account does not exists!'))
            next()
        },
        showIfLoggedIn: (req, res, next) => {
            req.session.isLoggedIn ? res.json(j('You are already logged in!')) : next()
        }
    }

    // endpoints
    app.use(route, middleWares.showIfLoggedIn)
    app.post(route + '/signup', 
        middleWares.checkifAlreadyExists,
        async (req, res) => {
            const { username, email, pw } = req.body

            const emKey = `email:${email}`
            const userkey = formatKey(username)
            const uservalue = {
                email, pw, createdAt: Date.now()
            }

            await client.hSet(userkey, uservalue)
            await client.set(emKey, userkey)

            res.status(201).json(j('New User added.'))

    })
    app.post(route + '/signin', 
        middleWares.checkIfAccountExists,
        async (req, res) => {

            const { email, pw } = req.body
            const emKey = `email:${email}`      
            const username = await client.get(emKey)

            const { pw: spw } = await client.hGetAll(username)
            if(pw != spw) return res.status(401).json(j('Incorrect Password!'))
        
            req.session.isLoggedIn = true
            req.session.userName = username
            res.status(200).json(j('You are now logged In!'))
    })

}