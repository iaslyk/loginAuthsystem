if (process.env.NODE_ENV !== 'production'){
    require("dotenv").config()
}

// 
const express = require('express');
const app = express();
const bcrypt = require("bcrypt");
const flash = require('express-flash');
const session = require('express-session');
const passport = require("passport");
const initializePassport = require('./passport_config')
const methodOverride = require("method-override");

app.set('view-engine', "ejs", "js");
app.use(express.urlencoded({extended: false}));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))
initializePassport(passport, username => users.find(user => user.username === username), id => users.find(user => user.id === id))

// Location for storting users
// This is a really bad practice, but since this is just for showing React programming practices,
// this will do just fine. Usually you link database here. You do not put users in array.
const users = []


// Main page
app.get("/", checkAuthenticated, (req, res) => {
    res.render("index.ejs", {name: req.user.username})
})

// Register routes
app.get("/register", checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})
app.post("/register", checkNotAuthenticated, async (req, res) => {
    // Hashing user password
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
        // This is only needed in this particular case. When using DB this is automatically generated.
            id: Date.now().toString(),
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    console.log(users)
})

// Login routes
app.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
})
app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))


// Logout routes
app.delete("/logout", (req, res) => {
    req.logOut()
    res.redirect("/login")
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

// Port listen
app.listen(3000);
