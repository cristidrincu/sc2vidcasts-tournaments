/**
 * Created by cristiandrincu on 10/30/14.
 */
var express = require('express');
var Quote = require('../../models/quote');

var helperFunctions = require('../../helpers/helpers-mongoose.js');
var middleware = require('../../helpers/helpers-middleware.js');

var app = module.exports = express();

app.get('/create-new-quote/:userId', middleware.isLoggedIn, middleware.requireRole('admin'), function(req, res){
	helperFunctions.getUserDetails(req.params.userId).then(function(user){
		res.render('quotes/create-quote.ejs', {
			user: req.user,
			userAvatar: user,
			successMessage: req.flash('infoSuccess'),
			errorMessage: req.flash('infoError')
		});
	});
});

app.post('/create-new-quote/:userId', middleware.isLoggedIn, middleware.requireRole('admin'), function(req, res){
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

app.get('/quotes-admin/:userId', middleware.isLoggedIn, middleware.requireRole('admin'), function(req, res){
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

app.get('/delete-quote/:quoteId', middleware.isLoggedIn, middleware.requireRole('admin'), function(req, res){
	helperFunctions.getQuoteDetails(req.params.quoteId).then(function(quote){
		res.render('quotes/delete/delete-quote.ejs', {
			user: req.user,
			quote: quote
		});
	});
});

app.post('/delete-quote/:quoteId', middleware.isLoggedIn, middleware.requireRole('admin'), function(req, res){
	helperFunctions.deleteQuote(req.params.quoteId, function(writeResult){
		if(writeResult){
			res.redirect('/quotes-admin/' + req.user._id);
		}else{
			res.send('Could not delete quote!');
		}
	});
});
