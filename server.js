/**
 * Created by cristiandrincu on 7/28/14.
 */

// set up ======================================================================
// get all the tools we need

var express = require('express');
var app = express();
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
var helperFunctions = require('./app/helpers/helpers-mongoose.js');

//use romanian locale for moment.js
moment.locale('ro');

//----------CONFIG-----------------------------
//connect to our database
mongoose.connect(configDB.url);

////bootstrap models
//var models_path = __dirname + '/app/models';
//fs.readdirSync(models_path).forEach(function (file) {
//  if (~file.indexOf('.js')) require(models_path + '/' + file)
//})


//pass passport for configuration
require('./config/passport.js')(passport);

//setup our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); //to support URL-encoded bodies, from forms
app.use(busboy());

app.use(express.static(path.join(__dirname, 'public')));

app.set('port', (process.env.PORT || 5000))
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// required for passport
app.use(session({ secret: 'warbringerisamothafuckah' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//routes
require('./app/routes.js')(app); //load our routes and pass in our app and fully configured passport

var api = require('./app/routes/api/api-routes');
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
var quote = require('./app/routes/quote/quote-route');
var error = require('./app/routes/error/error-route');

var logout = require('./app/routes/logout/logout-route');

app.use(api);
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
app.use(error);

app.use(logout);

//launch
app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'))
});

