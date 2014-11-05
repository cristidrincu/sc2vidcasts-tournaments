/**
 * Created by cristiandrincu on 7/28/14.
 */

// set up ======================================================================
// get all the tools we need

//use express and set it to run on port 8080
var express = require('express');
var app = express();
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var path = require('path');
var fs = require('fs');
var busboy = require('connect-busboy');
var _ = require('underscore');
var moment = require('moment');

var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan'); //logger
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');
var helperFunctions = require('./app/helpers-mongoose.js');

//----------CONFIG-----------------------------
//connect to our database
mongoose.connect(configDB.url);

//bootstrap models
//var models_path = __dirname + '/app/models'
//fs.readdirSync(models_path).forEach(function (file) {
//  if (~file.indexOf('.js')) require(models_path + '/' + file)
//})

//app.locals({
//  site: {
//    title: 'ExpressBootstrapEJS',
//    description: 'A boilerplate for a simple web application with a Node.JS and Express backend, with an EJS template with using Twitter Bootstrap.'
//  },
//  author: {
//    name: 'Cory Gross',
//    contact: 'CoryG89@gmail.com'
//  }
//});


//pass passport for configuration
require('./config/passport.js')(passport); //pass passport for configuration

//setup our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); //to support URL-encoded bodies, from forms
app.use(busboy());

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// required for passport
app.use(session({ secret: 'warbringerisamothafuckah' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//routes
require('./app/routes.js')(app); //load our routes and pass in our app and fully configured passport

var login = require('./app/routes/login/login-route');
var home = require('./app/routes/home/home-route');
var signup = require('./app/routes/signup/signup-route');
var profile = require('./app/routes/profile/profile-route');
var backend = require('./app/routes/backend/backend-route');
var messages = require('./app/routes/messages/messages-route');
var players = require('./app/routes/players/players-route');
var tournaments = require('./app/routes/tournaments/tournaments-route');
var admin = require('./app/routes/admin/admin-routes');
var organizer = require('./app/routes/organizer/organizer-routes');
var avatar = require('./app/routes/avatar/avatar-routes');
var editTournament = require('./app/routes/edit/edit-tournament');
var editQuote = require('./app/routes/edit/edit-quote');
var quote = require('./app/routes/quote/quote-route.js');

var logout = require('./app/routes/logout/logout-route');

app.use(home);
app.use(login);
app.use(signup);
app.use(profile);
app.use(backend);
app.use(messages);
app.use(players);
app.use(tournaments);
app.use(admin);
app.use(organizer);
app.use(avatar);
app.use(editTournament);
app.use(editQuote);
app.use(quote);

app.use(logout);


//launch
app.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
});