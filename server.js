/**
 * Created by cristiandrincu on 7/28/14.
 */

// set up ======================================================================
// get all the tools we need

//use express and set it to run on port 8080
var express = require('express');
var app = express();
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan'); //logger
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');

//----------CONFIG-----------------------------
//connect to our database
mongoose.connect(configDB.url);

//pass passport for configuration
require('./config/passport.js')(passport); //pass passport for configuration

//setup our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


//routes
require('./app/routes.js')(app, passport); //load our routes and pass in our app and fully configured passport

//launch
app.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
});