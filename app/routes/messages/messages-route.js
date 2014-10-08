/**
 * Created by cristiandrincu on 9/4/14.
 */
var express = require('express');
var User = require('../../models/user');
var Message = require('../../models/message');
var ErrorHandler = require('../../../app/helpers-error-handlers.js');
var helperFunctions = require('../../../app/helpers-mongoose.js');

var app = module.exports = express();

/*MESSAGING ROUTES*/
app.get('/send-message/:_id', isLoggedIn, function(req, res){
  helperFunctions.getUserDetails(req.params._id).then(function(player){
    res.render('messaging/send-message.ejs', {
      user: req.user,
	    userAvatar: player,
      player: player
    });
  });
});

app.get('/send-reply/:_receiverId/:_messageId', isLoggedIn, function(req, res){
  Message.findById(req.params._messageId).exec(function(err, messages){
    if(err)
      ErrorHandler.handle('A aparut o eroare la extragerea mesajului din baza de date ' + err);
    else
      helperFunctions.getUserDetails(req.params.userId).then(function(user){
	      res.render('messaging/send-reply.ejs', {
		      user: req.user,
		      userAvatar: user,
		      messages: messages,
		      receiverId: req.params._receiverId
	      });
      });

  });
});

/*TODO - UPDATE the message that is being sent as a reply instead of creating a new one - create a POST method for send-reply*/
//TODO - save all messages inside in array and use it as messages history

app.post('/send-message/:_id', isLoggedIn, function(req, res){
  var message = new Message( {messageBody: req.body.message, messageSubject: req.body.messageSubject, sentBy: req.user, receiver: req.params._id} );
  message.save(function(err){
    if(err)
      ErrorHandler.handle('A aparut o eroare la trimiterea mesajului' + err);
    else
      res.redirect('/backend-user/' + req.params._id);
  });
});

app.get('/user-messages/:userId', isLoggedIn, function(req, res){
  Message.find( {receiver: req.params.userId}).populate('sentBy').exec(function(err, messages){
    if(err)
      ErrorHandler.handle('A intervenit o eroare la preluarea mesajelor din baza de date: ' + err);
    else
      helperFunctions.getUserDetails(req.params.userId).then(function(user){
	      res.render('messaging/messages.ejs', {
		      user: req.user,
		      userAvatar: user,
		      messages: messages
	      });
      });
  });
});

app.get('/message-details/:_id/:userId', isLoggedIn, function(req, res){
  Message.findById(req.params._id).populate('sentBy').exec(function(err, message){
    if(err)
      ErrorHandler.handle('A aparut o eroare la extragerea mesajului din baza de date: ' + err);

	  helperFunctions.getUserDetails(req.params.userId).then(function(user){
		  res.render('messaging/message-details.ejs', {
			  user: req.user,
			  userAvatar: user,
			  messageDetails: message
		  });
	  });
  });
});

app.post('/delete-message/:_id', isLoggedIn, function(req, res){
  Message.findById(req.params._id).remove(function(err){
    if(err)
      ErrorHandler.handle('A aparut o eroare la stergerea mesajului din baza de date: ' + err);
    else
      res.redirect('/user-messages');
  });
});

/*ROUTE MIDDLEWARE - MAKE SURE A USER IS LOGGED IN*/
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}