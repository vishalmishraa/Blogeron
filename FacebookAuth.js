const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('./models/User');
require('dotenv').config();


passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_APP_CALLBACKURL,

    enableProof: true,
    profileFields: ['id', 'email', 'displayName', 'picture.type(large)']
},
    function (accessToken, refreshToken, profile, cb) {
        let email = profile.emails[0].value;
        let provider = profile.provider;
        let userid = profile.id;
        let name = profile.displayName;
        let image = profile.photos[0].value;
        var userdata = { email: email, provider: provider, userid: userid, name: name, image: image }

        User.findOrCreate(userdata, function (err, user) {
            return cb(null, profile);

        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

