var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;

module.exports = function (app) {
  // Passport session setup.
  //   To support persistent login sessions, Passport needs to be able to
  //   serialize users into and deserialize users out of the session.  Typically,
  //   this will be as simple as storing the user ID when serializing, and finding
  //   the user by ID when deserializing.  However, since this example does not
  //   have a database of user records, the complete GitHub profile is serialized
  //   and deserialized.
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  // Use the GitHubStrategy within Passport.
  //   Strategies in Passport require a `verify` function, which accept
  //   credentials (in this case, an accessToken, refreshToken, and GitHub
  //   profile), and invoke a callback with a user object.
  passport.use(new GitHubStrategy({
      clientID: process.env['GITHUB_KEY'],
      clientSecret: process.env['GITHUB_SECRET'],
      callbackURL: '/auth/callback'
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile._json);
      
      done(null, {
        profile: profile,
        token: accessToken
      });
    }
  ));

  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/auth',
    passport.authenticate('github'),
    function (req, res) {} // gets redirected to Github, so this doesn't get called
  );
  app.get('/auth/callback',
    passport.authenticate('github'), //, { failureRedirect: '/login' }),
    function (req, res) {
      res.redirect('/');
    }
  );
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
  // Simple route middleware to ensure user is authenticated.
  //   Use this route middleware on any resource that needs to be protected.  If
  //   the request is authenticated (typically via a persistent login session),
  //   the request will proceed.  Otherwise, the user will be redirected to the
  //   login page.
  function authorize () {
    return function (req ,res, next) {
      if (req.isAuthenticated()) { return next(); }
      res.send(403); // Forbidden
    };
  }
  
  return {
    authorize: authorize
  };
};










// var Octokit = require('octokit');

// module.exports = function(app) {
//   var githubOAuth = require('github-oauth')({
//     githubClient: process.env['GITHUB_KEY'],
//     githubSecret: process.env['GITHUB_SECRET'],
//     baseURL: process.env['ORIGIN'],
//     loginURI: '/auth',
//     callbackURI: '/auth/callback',
//     scope: 'gist'
//   });

//   app.get('/auth', githubOAuth.login);
//   app.get('/auth/callback', function(req, res) {
//     var gh = Octokit.new({token: token.access_token});
    
//     gh.getUser().getInfo().then(function(user) {
//       // req.session.user_id = user.id;
//       console.log(req);
//       res.redirect('/');
//     });
    
//     githubOAuth.callback(req, res);
//   });
  
//   return githubOAuth;
// };
