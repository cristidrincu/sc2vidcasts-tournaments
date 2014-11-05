/**
 * Created by cristiandrincu on 10/30/14.
 */
var express = require('express');
var Quote = require('../../models/quote');
var helperFunctions = require('../../../app/helpers-mongoose.js');

var app = module.exports = express();

app.get('/create-new-quote/:userId', isLoggedIn, requireRole('admin'), function(req, res){
	helperFunctions.getUserDetails(req.params.userId).then(function(user){
		res.render('quotes/create-quote.ejs', {
			user: req.user,
			userAvatar: user,
			successMessage: req.flash('infoSuccess'),
			errorMessage: req.flash('infoError')
		});
	});
});

app.post('/create-new-quote/:userId', isLoggedIn, requireRole('admin'), function(req, res){
	var quote = new Quote( {quoteInsertedBy: req.user._id, quoteAuthor: req.body.quoteAuthorName, quoteText: req.body.quoteText} );
	quote.save(function(err){
		if(err){
			req.flash('infoError', 'Citatul nu a putut fi introdus in baza de date! Mai incearca!');
			res.redirect('/create-new-quote/' + req.user._id);
		}else{
			req.flash('infoSuccess', 'Citatul a fost introdus in baza de date! Mai incarca un citat!');
			res.redirect('/create-new-quote/' + req.user._id);
		}
	});
});

app.get('/quotes-admin/:userId', isLoggedIn, requireRole('admin'), function(req, res){
	helperFunctions.getUserDetails(req.params.userId).then(function(user){
		helperFunctions.retrieveQuotes().then(function(quotes){
			res.render('quotes/quotes-list.ejs', {
				user: req.user,
				userAvatar: user,
				quotes: quotes,
				successMessage: req.flash('infoSuccess'),
				errorMessage: req.flash('infoError')
			});
		});
	});
});



/*ROUTE MIDDLEWARE - MAKE SURE A USER IS LOGGED IN*/
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	res.redirect('/');
}

function requireRole(role){
	return function(req, res, next){
		if(req.user.local.role === role){
			next();
		}
		else{
			res.send(403);
		}
	}
}
