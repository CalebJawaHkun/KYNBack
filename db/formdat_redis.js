const { v4: uuid4 } = require('uuid')
const bcrypt = require('bcrypt')

/*
    indexed email
    K: email:<email>
    V: <uuid>

    userdata
    K: user:<uuid>
    V: { name, email, pw, createdAt }

    bcrypt is used for password hashing
    await bcrypt.hash(v)
    await bcrypt.compare(plain v, hashed v)

    uuid is used for special unique ids for users.
    uuid() : returns the uuid
    uuid: universaly unique identifier


*/


module.exports = (client, app) => {
    const em_form = e => 'email:' + e
    const setEmIndex = async (formatedEm, id) => await client.set(formatedEm, id)
    const id_form = id => 'user:' + id
    const setnewUserCre = async (formatedId, userdat) => await client.hSet(formatedId, userdat)

    const route = '/acc'
    const mwares = {
        checkIfAlreadyExits: async (req, res, next) => {
            const { email } = req.body
            if(await client.exists(em_form(email))) return res.status(409).json({msg: `Account Already Exists!`})
            next()
        },
        checkIfAccountExists: async (req, res, next) => {
            const { email } = req.body
            const foramtedEm = em_form(email)

            if(!await client.exists(foramtedEm)) return res.status(404).json({msg: 'Email Does not exists!'})
            next()
        }
    }

    app.post(route + '/signup', 
        mwares.checkIfAlreadyExits,
        async (req, res) => {
            const { email, pw } = req.body
            const userId = id_form(uuid4())
            const formatedEm = em_form(email)

            const hashedPw = await bcrypt.hash(String(pw), 10)
            req.body.pw = hashedPw

            const userData = { ...req.body, createdAt: new Date().toString() }

            setEmIndex(formatedEm, userId)
            setnewUserCre(userId, userData)

            console.log('New User.')
            res.json({msg: 'New User Added!'})
        }
    )
    app.post(route + '/signin', 
        mwares.checkIfAccountExists,
        async (req, res) => {
            const { email, pw } = req.body
            const userId = await client.get(em_form(email))
            const userdata = await client.hGetAll(userId)

            // console.log(`Sent Pw: '${pw}'.`)
            // console.log(`Dat: `, JSON.stringify(userdata))


            const isAuthen = await bcrypt.compare(String(pw), userdata.pw)
            if(!isAuthen) return res.status(401).json({msg: 'Incorrect Password!'})
            
            // initlize session
            req.session.isLoggedIn = true
            req.session.userId = userId

            res.json({msg: 'You are logged In!'})

        }
    )
}