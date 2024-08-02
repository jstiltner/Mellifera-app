// config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { jwtSecret, googleClientID, googleClientSecret } = require('../config/keys');

// Local Strategy
passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: 'Invalid credentials' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// JWT Strategy
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

passport.use(
  new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
      const user = await User.findById(jwtPayload.userId);
      if (user) return done(null, user);
      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  })
);

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:5050/auth/facebook/callback",
  passReqToCallback: true,
  profileFields: ['id','displayName', 'emails']
},
async function(req, accessToken, refreshToken, profile, cb) {
  await User.findOrCreate(profile, function (err, user, created) {
    if (err) { return cb(err); }
    console.log(created, profile); // Log the profile for debugging purposes
    return cb(null, user);
  });
}
));

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: googleClientID,
      clientSecret: googleClientSecret,
      callbackURL: '/api/auth/google/callback',
    },
    async (token, tokenSecret, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        user = new User({ googleId: profile.id, email: profile.emails[0].value });
        await user.save();
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, false);
  }
});
