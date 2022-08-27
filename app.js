//GETTING STARTED, DEFAULT SHIT NEEDED
//ENV SETUP
require('dotenv').config();
//including our frameworks/libraries
const express = require("express"),
    methodOverride = require("method-override"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    maven = require('maven'),
    url = require('url'),
    flash = require('connect-flash'),
    path1 = require('path'),
    app = express(),
    imgModel = require('./models/blog'),
    multer = require('multer'),
    session = require('express-session'),
    Blog = require('./models/blog'),
    User = require('./models/User'),
    passport = require('passport'),
    GooglePerson = require('./GoogleAuth'),

    blog = require('./models/blog'),
    FbPerson = require('./FacebookAuth'),
    fs = require('fs'),
    path = require("path"),
    LocalStrategy = require('passport-local'),
    { storage, cloudinary } = require('./cloudinary'),
    upload = multer({ storage: storage });
require('./GoogleAuth');


let isLoggedIn = (req, res, next) => {
    console.log(req.user);
    req.user ? next() : res.redirect("/login");
}
let isLoggedOut = (req, res, next) => {
    !req.user ? next() : res.redirect("/");
}

//mongoose conneetion intializing
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log("database connected");
}).catch(err => {
    console.log('ERROR', err.message);
});//connecting mongo -> THE NAME OF WHAT WE WILL LOOK FOR IN MONGO

//session Config
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

// auth router attaches /login, /logout, and /callback routes to the baseURL
// APP CONFIG
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
app.set("view engine", "ejs"); //connecting ejs
app.use(express.static("public")); //using express
app.use(bodyParser.urlencoded({ extended: true })); //using body-parser
app.use(methodOverride("_method"));//using method-override + what to look for in url *the parentheses as above*
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static('uploads'));
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.auth = req.user;
    next();
});
require('./LocalAuth');


app.get('/', (req, res) => {
    res.render("landing");
    console.log(req.user);
});


app.get("/callback", (req, res) => {
    res.redirect("/blogs");
})

//INDEX ROUTE
app.get("/blogs", isLoggedIn, function (req, res) {
    Blog.find({}, function (err, blogs) { // adding index functionality to retrieve all blogs from database
        if (err) {
            console.log(err);
        } else {
            console.log("blogs found ==============================");
            console.log(req.user);
            res.render("index", { blogs: blogs, auth: req.user }); //blogs:blogs -> render index with data (blogs is the data)
        }
    });
});


//NEW ROUTE
app.get("/blogs/new", isLoggedIn, function (req, res) {
    res.render("new");// all we have to do is render b/c its new
});



//CREATE ROUTE
app.post("/blogs", upload.single("image"), isLoggedIn, function (req, res) {
    //create b
    let imageurl = req.file.path;
    console.log(imageurl);
    var blogID = req.user._id;
    var email = req.user.emial;
    var authorName = req.user.displayName;
    var title = req.body.title;
    var body = req.body.body;
    var image = {
        url: imageurl,
        filename: req.file.filename
    };

    let newBlog = { blogID: blogID, title: title, body: body, image: image, email: email, authorName: authorName };

    Blog.create(newBlog, function (err) {
        if (err) {
            console.log(err);
            res.render("new");
        } else {
            //if successful, redirect to index
            console.log("success---------");
            res.redirect('/blogs');
        }
    });
});

//SHOW ROUTE
app.get("/blogs/:id", isLoggedIn, function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if (err) {
            res.redirect("/blogs");
        } else {
            console.log(foundBlog.blogID + "   blogid");
            res.render("show", { blog: foundBlog, author: req.user._id });
        }
    })
});

//EDIT ROUTE

app.get("/blogs/:id/edit", isLoggedIn, function (req, res) {


    Blog.findById(req.params.id, function (err, foundBlog) {
        console.log(foundBlog);
        console.log("blogID " + foundBlog.blogID + " userid " + req.user._id + "=========------");
        if (err) {
            res.redirect("/blogs");
        } else if (foundBlog.blogID == req.user._id) {
            res.render("edit", { blog: foundBlog });
        } else {
            res.redirect("/blogs");
        }
    });
});

//UPDATE ROUTE
app.put("/blogs/:id", upload.single("image"), isLoggedIn, function (req, res) {
    console.log("**********************++++++++++++++++++++++=================================");
    console.log("**********************++++++++++++++++++++++=================================");

    let imageurl = req.file.path;
    var title = req.body.title;
    var image = {
        url: imageurl,
        filename: req.file.filename
    };
    var body = req.body.body;
    var user = req.params.id;
    console.log("hello" + user + "============_==_+_+_+_+_");
    const updateBlog = { $set: { title: title, image: image, body: body } };

    console.log(updateBlog + " update blog ------------");
    var myquery = { address: req.params.id };
    console.log("address : -----" + myquery);

    Blog.findByIdAndUpdate(user.trim(), updateBlog, function (err, updateBlog1) {

        if (err) {
            console.log(err);
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });

});

//DELETE ROUTE
app.delete("/blogs/:id", isLoggedIn, function (req, res) {
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, function (err, blog) {
        if (err) {
            console.log(err + " DELETE ERROR");
            res.redirect("/blogs");
        } else {
            //redirect somewhere
            res.redirect("/blogs");
        }
    });

});


app.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] }
    ));
app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: ['email'] }));


app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/blogs',
        failureRedirect: '/auth/google/failure'
    })
);
app.get('/auth/facebook/callback',
    passport.authenticate('facebook'),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/blogs');
    });




app.get('/auth/google/failure', (req, res) => {
    res.send('Failed to authenticate..');
});

app.get("/logout", (req, res) => {
    req.logout();
    req.session.destroy();
    console.log("logged out *******");
    res.redirect('/');
})

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
    res.redirect('/blogs');
})





app.listen(process.env.PORT, () => {
    console.log("Server connected: http://localhost:", process.env.PORT);
});