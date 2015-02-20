/**
 * Created by cristiandrincu on 9/4/14.
 */
var express = require('express');
var User = require('../../models/user');
var Message = require('../../models/message');
var Avatar = require('../../models/avatar');
var ErrorHandler = require('../../../app/helpers-error-handlers.js');
var helperFunctions = require('../../../app/helpers-mongoose.js');
var middleware = require('../../helpers-middleware.js');
var _ = require('underscore');
var expose = require('express-expose');
var escapeHtml = require('escape-html');

var app = module.exports = express();

/*MESSAGING ROUTES*/
app.get('/send-new-message', middleware.isLoggedIn, function(req, res){
	helperFunctions.getUserDetails(req.user._id).then(function(user){
		helperFunctions.retrieveAllPlayers().then(function(players){
			var autoCompletePlayerNames = _.map(players, function(player){
				return player.local.nickname
			});
			res.expose(autoCompletePlayerNames, 'players');
			res.render('messaging/send-new-message.ejs', {
				user: req.user,
				userAvatar: user
			});
		});
	});
});

app.get('/send-message/:_id', middleware.isLoggedIn, function(req, res){
  helperFunctions.getUserDetails(req.user._id).then(function(sender){
	  helperFunctions.getUserDetails(req.params._id).then(function(receiver){
		  res.render('messaging/send-message.ejs', {
			  user: req.user,
			  userAvatar: sender,
			  messageReceiver: receiver
		  });
	  });
  });
});

app.get('/send-reply/:_receiverId/:_messageId', middleware.isLoggedIn, function(req, res){
  Message.findById(req.params._messageId).exec(function(err, message){
    if(err)
      ErrorHandler.handle('A aparut o eroare la extragerea mesajului din baza de date ' + err);
    else
    helperFunctions.getUserDetails(req.user._id).then(function(sender){
	    helperFunctions.getUserDetails(req.params._receiverId).then(function(receiver){
		    res.render('messaging/send-reply.ejs', {
			    user: req.user,
			    userAvatar: sender,
			    receiver: receiver,
			    message: message,
			    receiverId: req.params._receiverId
		    });
	    });

    });
  });
});

/*TODO - UPDATE the message that is being sent as a reply instead of creating a new one - create a POST method for send-reply*/
//TODO - save all messages inside an array and use it as messages history

app.post('/send-message/:_id', middleware.isLoggedIn, function(req, res){
	var messageBody = escapeHtml(req.body.message);
  var message = new Message( {messageBody: messageBody, messageSubject: req.body.messageSubject, sentBy: req.user._id, receiver: req.params._id} );
  message.save(function(err){
    if(err){
	    ErrorHandler.handle('A aparut o eroare la trimiterea mesajului' + err);
	    req.flash('infoError', 'Mesajul nu a putut fi trimis!');
	    res.redirect('/user-messages/' + req.user._id);
    }else
      req.flash('infoSuccess', 'Mesajul a fost trimis cu success!')
      res.redirect('/user-messages/' + req.user._id);
  });
});

app.post('/send-message', middleware.isLoggedIn, function(req, res){
	helperFunctions.getUserIdName(req.body.messageReceiver).then(function(id){
		var message = new Message( {messageBody: req.body.message, messageSubject: req.body.messageSubject, sentBy: req.user._id, receiver: id} );
		message.save(function(err){
			if(err){
				ErrorHandler.handle('A aparut o eroare la trimiterea mesajului' + err);
				req.flash('infoError', 'Mesajul nu a putut fi trimis!');
				res.redirect('/user-messages/' + req.user._id);
			}else
				req.flash('infoSuccess', 'Mesajul a fost trimis cu success!')
			res.redirect('/user-messages/' + req.user._id);
		});
	});
});

app.post('/send-reply/:receiverId/:messageId', middleware.isLoggedIn, function(req, res){
	var messageBody = escapeHtml(req.body.message);
	var replyForSender = new Message( {messageBody: messageBody, messageSubject: req.body.messageSubject, sentBy: req.user._id, receiver: req.params.receiverId} );

	replyForSender.save(function(err){
		if(err) throw err;
	});

	Message.findById(req.params.messageId).exec(function(err, message){
		if(err) throw err;

		if(message){
			message.messageSubject = req.body.messageSubject;
			message.messageBody += req.body.message;
		}

		message.save(function(err){
			if(err) throw err;
		});

		res.redirect('/user-messages/' + req.user._id);
	});
});

app.get('/user-messages/:userId', middleware.isLoggedIn, function(req, res){
  Message.find( {receiver: req.params.userId}).populate('sentBy').exec(function(err, messages){
    if(err){
	    ErrorHandler.handle('A intervenit o eroare la preluarea mesajelor din baza de date: ' + err);
    }else {
	    helperFunctions.getUserDetails(req.params.userId).then(function(user){
		    res.render('messaging/messages.ejs', {
			    user: req.user,
			    userAvatar: user,
			    messages: messages
		    });
	    });
    }

    helperFunctions.getUserDetails(req.params.userId).then(function(user){
	    messages.forEach(function(message){
		    User.populate(message.sentBy, {path: 'local.avatar'}, function(err, sender){
			    if(err) throw err;
			    res.render('messaging/messages.ejs', {
				    user: req.user,
				    userAvatar: user,
				    sender: sender,
				    messages: messages
			    });
		    });
	    });
    });

  });
});

app.get('/message-details/:_id/:userId', middleware.isLoggedIn, function(req, res){
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

app.post('/delete-message/:_id', middleware.isLoggedIn, function(req, res){
  Message.findById(req.params._id).remove(function(err){
    if(err)
      ErrorHandler.handle('A aparut o eroare la stergerea mesajului din baza de date: ' + err);
    else
      res.redirect('/user-messages/' + req.user._id);
  });
});