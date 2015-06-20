/**
 * Created by cristiandrincu on 11/4/14.
 */
var express = require('express');
var helperFunctions = require('../../helpers/helpers-mongoose.js');
var middleware = require('../../helpers/helpers-middleware.js');
var Quote = require('../../../app/models/quote');

var app = module.exports = express();

app.get('/edit-quote/:quoteId', middleware.isLoggedIn, middleware.requireRole('admin'), function(req, res){
	helperFunctions.getQuoteDetails(req.params.quoteId).then(function(quote){
		res.render('quotes/edit/edit-quote.ejs', {
			user: req.user,
			quote: quote
		});
	});
});

app.post('/edit-quote/:quoteId', middleware.isLoggedIn, middleware.requireRole('admin'), function(req, res){
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
