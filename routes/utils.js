module.exports = exp => {
    const router = exp.Router()

    router.get('/status', (req, res) => {
        const userId = req.session?.userId
        console.log(`Client requested Status. User Id: ${userId}.`)
        res.status(200).json(userId ? 
            {loggedIn: true, userId}:{loggedIn: false}
        )
    })

    return router
}