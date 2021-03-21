const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt");

function initialize(passport, getUserByUsername, getUserById){
    const authenticateUser = async (username, password, done) => {
        const user = getUserByUsername(username)
        if (user == null){
            return done(null, false, {message: "no user with that username"})
        }
        try {
            if ( await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, {message: "Password incorrect"})

            }
        } catch (error){
            return done(error)

        }
    }
    passport.use(new LocalStrategy({usernameField: "username"}, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => done(null, getUserById(id)))
}


module.exports = initialize