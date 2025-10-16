module.exports = exp => {
  const router = exp.Router()
  const store = []

  router.use(
  (req, res, next) => {
    console.log(req.cookies)
    next()
  }, (req, res, next) => {
    const isLoggedIn = req.session.isLoggedIn
    if(isLoggedIn) console.log(`You are logged In.`)
    next()
  }, (req, res, next) => {
    const hasAccount = req.session.hasAccount
    console.log(
      'Go to ', hasAccount ? '/signin' : '/signup'
    )
    next()
  })
  
  router.post('/signup', (req, res) => {
    const dat = req.body
    const myses = req.session

    myses.userData = dat
    myses.hasAccount = true
    store.push(dat)

    res.json({status: 'Signed Up!'})
  })
  router.post('/signin', (req, res) => {
    const hasAccount = req.session.hasAccount 
    if(!hasAccount) return res.send('You must set an account first!')

    const { email, pw } = req.body
    const { email : eEmail, pw : Epw } = req.session.userData

    const authenticated = (email === eEmail && pw === Epw)
    if(authenticated) {
      console.log('Was Authen!')
      req.session.isLoggedIn = authenticated
      res.json({status: `You are now logged In!`})
    }
  })
  router.get('/allusers', (req, res) => {
    res.json(store.length === 0 ? 
      'There are no users yet!' 
      : 
      JSON.stringify(store))
  })
  router.post('/logout', (req, res) => {

      if(!req.session.isLoggedIn) return res.send('You are not even logged in yet')

      req.session.destroy(err => {
        if(err) {
          console.error('Failed to destory the session.', err)
          return res.status(500).send('Failed to logout!')
        }
      })

      res.clearCookie(req.cookies['connect.sid'])
      res.send('Your session has now been destroyed! You are completely logged out!')
  })

  return router
}