require('dotenv').config();
const
    express = require('express'),
    session = require('express-session'),
    mongoose = require('mongoose'),
    flash = require('connect-flash'),
    User = require('./models/User'),
    app = express(),
    passport = require('passport'),
    GooglePerson = require('./GoogleAuth'),
    FbPerson = require('./FacebookAuth');
require('./GoogleAuth');





let isLoggedIn = (req, res, next) => {
    console.log(req.user);
    req.user ? next() : res.redirect("/login");
}
let isLoggedOut = (req, res, next) => {
    !req.user ? next() : res.redirect("/secret");
}



app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
            // secure: true, // becareful set this option, check here: https://www.npmjs.com/package/express-session#cookiesecure. In local, if you set this to true, you won't receive flash as you are using `http` in local, but http is not secure
        },
    })
);
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

db = async () => {
    await mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    }).then(() => {
        console.log("database connected");
    }).catch(err => {
        console.log('ERROR', err.message);
    });//connecting mongo -> THE NAME OF WHAT WE WILL LOOK FOR IN MONGO

}
db();

require('./LocalAuth');



app.get("/", (req, res) => {
    res.render("index", { user: req.user });

});

//=============================================================================================



app.get("/signup", isLoggedOut, (req, res) => {
    res.render('signup');

});

app.post("/signup", isLoggedOut, async (req, res) => {
    const
        email = req.body.email,
        name = req.body.name,
        password = req.body.password

    if (!email || !name || !password) {
        res.render('signup', { error: "Enter all the details" });
    } else {
        try {
            let userdata = { username: req.body.email, displayName: req.body.name, email: req.body.email };
            const user = new User(userdata);
            const NewUSer = await User.register(user, req.body.password);
            console.log(NewUSer);
            res.render('login', { success: "hey..! you are signed up! now login" })
        } catch (error) {
            res.render('signup', { error: error.message });
        }
    }

});

app.get("/login", isLoggedOut, (req, res) => {
    res.render('login');
});

app.post('/login', isLoggedOut, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    res.redirect('/secret');
})
//============================================================================================================

app.get("/logout", (req, res) => {
    req.logout();
    req.session.destroy();
    console.log("logged out *******");
    res.redirect('/login');
})





app.get("/secret", isLoggedIn, (req, res) => {
    console.log("google : ", GooglePerson._json);
    console.log("google : ", req.user);
    if (req.user.provider == 'facebook') {
        console.log("here " + req.user.photos[0].value + "*********++++++");
        const picture = req.user.photos ? req.user.photos[0].value : '/img/faces/unknown-user-pic.jpg';
        console.log(picture);
    }

    res.render("secret", { user: req.user });
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] }
    ));
app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: ['email'] }));


app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/secret',
        failureRedirect: '/auth/google/failure'
    })
);
app.get('/auth/facebook/callback',
    passport.authenticate('facebook'),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/secret');
    });




app.get('/auth/google/failure', (req, res) => {
    res.send('Failed to authenticate..');
});






app.listen(process.env.PORT, () => {
    console.log("Server connected: ", process.env.PORT);
});
