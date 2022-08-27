const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require('./models/User');

require('dotenv').config();

let person;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_APP_CALLBACKURL,
  passReqToCallback: true,
},
  function (request, accessToken, refreshToken, profile, done) {
    console.log(profile._json);
    // let createdata = () => {
    let email = profile._json.email;
    let provider = profile.provider;
    let userid = profile._json.sub;
    let displayName = profile._json.name;
    let image = profile._json.picture;
    var userdata = { email: email, provider: provider, userid: userid, displayName: displayName, image: image }
    User.findOrCreate(userdata, function (err, user) {
      return done(err, user);
    });
  }
));


passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});



