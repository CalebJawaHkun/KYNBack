module.exports = exp => {
    const router = exp.Router()

    const store = new Map()

    router.use((req, res, next) => {
        req.session.on = true
        next()
    })
    router.route('/crud')
        .post((req, res) => {
            const { K, V } = req.body
            store.set(K, V)

            if(store.has(K)) res.status(200).json(`New Item with Key: ${K} is set!`)
        })
        .get((req, res) => {
            const { K } = req.query
            
            if(!K) return res.json(`No key detecetd!`)
            const requested = store.get(K)
            if(!requested) return res.json(`No such item with that key!`)

            res.json({K, V: store.get(K)})
        })
        .delete((req, res) => {
            const { K } = req.query
            if(!K) return res.json(`No key detecetd!`)

            const ok = store.delete(K)
            if(!ok) return res.json(`No such item with that key!`)

            res.json(`Item with Key: ${K} is removed!`)
        })
        .put((req, res) => {
            const { K, V } = req.body
            if(!store.has(K)) return res.json(`No item with key: ${K}`)

            store.set(K, V)
            res.json(`Updated: ${K}'s value to: ${V}`)
        })
    
    router.get('/crud_all', (req, res) => {
        res.json(Array.from(store))
    })


    return router
}