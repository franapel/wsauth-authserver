
const PORT = process.env.PORT || 5000
const ORIGIN = process.env.CLIENT_URL || 'http://localhost:3000'

const users = require('./resources/users')
const express = require('express')
const cors = require('cors')
const app = express()
const passport = require('passport')
require('./config/passport')
const jwt = require('jsonwebtoken')

app.use(cors({ origin: ORIGIN }))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(passport.initialize())

const issueJWT = (user) => {
    const id = user.id
    const expiresIn = '1h'
    const payload = {
        sub: id,
        iat: Date.now()
    }
    const signedToken = jwt.sign(payload, process.env.JWT_SECRET || 'secreto', { expiresIn: expiresIn })
    return { token: 'Bearer ' + signedToken, expires: expiresIn}
}

app.post('/login', (req, res) => {
    const reqUser = req.body
    const user = users.find(user => user.id === reqUser.id)
    if (user) {
        if (reqUser.password === user.password) {
            const newToken = issueJWT(user)
            res.status(200).json({ success: true, 
                user: user.id, token: newToken.token, expiresIn: newToken.expires })
        } else {
            res.status(401).json({ success: false, msg: 'Wrong password' })
        }
    } else {
        res.status(401).json({ success: false, msg: 'Invalid user' })
    }
})

app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.status(200).json({ success: true, msg: 'Authorized' })
})

app.post('/auth', (req, res) => {
    const token = req.body.token.split(' ')[1]
    jwt.verify(token, 'secreto', (err, decoded) => {
        if (err) {
            console.log('Auth error')
            res.status(401).send({ success: false, msg: 'User not authenticated' })
        }
        else res.status(200).send({ success: true, msg: 'User autheticated', user_id: decoded.id })
    })
})

app.get('/logout', (req, res) => {
    if (req.isAuthenticated()) {
        req.logout()
        res.status(200).send({ success: true, msg: 'Logged out' })
    } else {
        res.status(401).send({ success: false, msg: 'You are not authenticated' })
    }    
})


app.listen(PORT, () => {
    console.log('Server listening on port ' + PORT)
})

