const users = require('../resources/users')
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'secreto'
}

passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    console.log(jwt_payload)
    try {
        const user = users.find(user => user.id === jwt_payload.sub)
        if (user) {            
            return done(null, user)
        } else return done(null, false)
    } catch (err) {
        return done(err, false)
    }
}))

module.exports = passport