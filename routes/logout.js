const { response } = require('./signcommon')

module.exports = exp => {
    const router = exp.Router()


    router.post('/logout', async (req, res) => {
        try {
            /*
            const authType = req.session?.authType || 'local'

            if(authType === 'google') 
                console.log('Loggin Out Of google user...(comming soon).') */
            
            req.session.destroy(err => {
                if(err) {
                    console.error('Error Destroying the session: ', err)
                    return res.status(500).json(response(false, 'Logout failed!'))
                }

                res.clearCookie(process.env.COOKIE_NAME)
                return res.json(response(true, 'Logged out successfully as local mode.'))

            })

        } catch (err) {
            console.error('Logout Error: ', err)
            res.status(500).json(response(false, 'Server error during logout.'))
        }
    })

    return router
}