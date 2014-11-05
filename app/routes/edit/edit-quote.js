/**
 * Created by cristiandrincu on 11/4/14.
 */
var express = require('express');
var helperFunctions = require('../../../app/helpers-mongoose.js');
var Quote = require('../../../app/models/quote');

var app = module.exports = express();

app.get('/edit-quote/:quoteId', isLoggedIn, requireRole('admin'), function(req, res){
	helperFunctions.getQuoteDetails(req.params.quoteId).then(function(quote){
		res.render('quotes/edit/edit-quote.ejs', {
			user: req.user,
			quote: quote
		});
	});
});

app.post('/edit-quote/:quoteId', isLoggedIn, requireRole('admin'), function(req, res){
	helperFunctions.getQuoteDetails(req.params.quoteId).then(function(quote){
		quote.quoteAuthor = req.body.quoteAuthor;
		quote.quoteText = req.body.quoteText;
		quote.quoteInsertedBy = req.user._id;

		quote.save(function(err){
			if(err){
				req.flash('infoError', 'A aparut o eroare in salvarea modificarilor pentru citat');
				res.redirect('/quotes-admin/' + req.user._id);
			}else{
				req.flash('infoSuccess', 'Modificarile au fost efectuate cu succes');
				res.redirect('/quotes-admin/' + req.user._id);
			}
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
