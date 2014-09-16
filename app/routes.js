/**
 * Created by cristiandrincu on 7/28/14.
 */
module.exports = function (app) {

  /*RULES FOR ACCESS*/
  app.all('/profile/*', isLoggedIn);
  app.all('/customize-profile/*', isLoggedIn);
};

/*ROUTE MIDDLEWARE - MAKE SURE A USER IS LOGGED IN*/
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}
