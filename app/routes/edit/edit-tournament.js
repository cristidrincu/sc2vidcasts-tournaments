/**
 * Created by cristiandrincu on 10/10/14.
 */
var express = require('express');
var helperFunctions = require('../../../app/helpers-mongoose.js');
var User = require('../../../app/models/user');
var Tournament = require('../../../app/models/tournament');
var moment = require('moment');
var _  = require('underscore');
var Q = require('q');
var nodemailer = require('nodemailer');
// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: 'starcraft2vidcasts@gmail.com',
		pass: 'crusader22012'
	}
});

var app = module.exports = express();
//TODO - creaza un modul de middleware pentru functiile folosite pe rute
app.get('/edit-tournament/:tournamentId/:userId', isLoggedIn, requireMultipleUserRoles('Organizator', 'admin'), function(req, res){
	helperFunctions.retrieveTournamentDetails(req.params.tournamentId, req.params.userId).then(function(tournament){
		res.render('tournament/edit/edit-tournament-basic-info.ejs', {
			user: req.user,
			tournament: tournament,
			successMessage: req.flash('infoSuccess'),
			errorMessage: req.flash('infoError')
		});
	});
});

app.get('/informatii-de-baza/:tournamentId/:userId', isLoggedIn, requireRole('Organizator'), function(req, res){
	helperFunctions.retrieveTournamentDetails(req.params.tournamentId, req.params.userId).then(function(tournament){
		res.render('tournament/edit/edit-tournament-basic-info.ejs', {
			user: req.user,
			tournament: tournament,
			errorMessage: req.flash('infoError'),
			successMessage: req.flash('infoSuccess')
		});
	});
});

app.post('/informatii-de-baza/:tournamentId/:userId', isLoggedIn, requireRole('Organizator'), function(req, res){

	var players = [];
	var oldTournamentName, oldTournamentEdition, oldIngameChatChannel, oldTwitchStreamChannel, oldDescription;

	Tournament.findById(req.params.tournamentId).populate('players').exec(function(err, tournament){
		if(err){
			throw err;
		}

		oldTournamentName = tournament.tournamentName;
		oldTournamentEdition = tournament.edition;
		oldIngameChatChannel = tournament.ingameChatChannel;
		oldTwitchStreamChannel = tournament.twitchStreamChannel;
		oldDescription = tournament.description;

		tournament.tournamentName = req.body.tournamentName;
		tournament.edition = req.body.edition;
		tournament.ingameChatChannel = req.body.ingameChatChannel;
		tournament.twitchStreamChannel = req.body.twitchStreamChannel;
		tournament.description = req.body.description;

		tournament.players.forEach(function(player){
			players.push(player.local.email);
		});

		tournament.save(function(err){
			if(err){
				req.flash('infoError', 'A aparut o eroare la modificare informatiilor de baza pentru acest turneu. Te rugam sa mai incerci!');
				res.redirect('/informatii-de-baza/' + req.params.tournamentId + '/' + req.params.userId);
			}

			req.flash('infoSuccess', 'Informatiile de baza pentru acest turneu au fost modificate cu success!');

			//send email to all participants in the tournament
			var mailOptions = {
				from: 'Starcraft2 Vidcasts Romania starcraft2vidcasts@gmail.com',
				to: '' + players.toString() + '', // list of receivers
				subject: 'Modificari in cadrul turneului ' + tournament.tournamentName,
				html:
						'<p>Salut. Te anuntam ca au avut loc schimbari la informatiile de baza ale turneului in care participi:</p> ' +
						'<br/><b>Numele turneului: </b> ' + checkTournamentUpdatedProps(oldTournamentName, tournament.tournamentName) +
						'<br/><b>Editia turneului: </b> ' + checkTournamentUpdatedProps(oldTournamentEdition, tournament.edition) +
						'<br/><b>Canal de chat pentru concurs:</b> ' + checkTournamentUpdatedProps(oldIngameChatChannel, tournament.ingameChatChannel) +
						'<br/><b>Canalul de twitch: </b> ' + checkTournamentUpdatedProps(oldTwitchStreamChannel, tournament.twitchStreamChannel)
			};

			// send mail with defined transport object
			transporter.sendMail(mailOptions, function(error, info){
				if(error){
					console.log(error);
				}else{
					console.log('Message sent: ' + info.response);
				}
			});

			res.redirect('/informatii-de-baza/' + req.params.tournamentId + '/' + req.params.userId);
		});
	});
});

app.get('/locuri-disponibile/:tournamentId/:userId', isLoggedIn, requireRole('Organizator'), function(req, res){
	helperFunctions.retrieveTournamentDetails(req.params.tournamentId, req.params.userId).then(function(tournament){
		res.render('tournament/edit/locuri-disponibile-info.ejs', {
			user: req.user,
			tournament: tournament,
			successMessage: req.flash('infoSuccess'),
			errorMessage: req.flash('infoError'),
			underscore: _
		});
	});
});

app.post('/locuri-disponibile/:tournamentId/:userId', isLoggedIn, requireRole('Organizator'), function(req, res){
	Tournament.findById(req.params.tournamentId).exec(function(err, tournament){
		if(err){
			throw err;
		}

		if(parseInt(req.body.nrOfPlayers) < parseInt(tournament.nrOfPlayers)){
			req.flash('infoError', 'Nu poti modifica turneul cu un numar mai mic de jucatori decat cel precedent!');
			res.redirect('/locuri-disponibile/' + req.params.tournamentId + '/' + req.params.userId);
		}else{
			tournament.nrOfPlayers = req.body.nrOfPlayers;
			tournament.save(function(err){
				if(err){
					throw err;
				}
				req.flash('infoSuccess', 'Numarul de locuri pentru turneu a fost modificat cu succes!');
				res.redirect('/locuri-disponibile/' + req.params.tournamentId + '/' + req.params.userId);
			});
		}
	});
});

app.get('/ligi-turneu/:tournamentId/:userId', isLoggedIn, requireRole('Organizator'), function(req, res){
	helperFunctions.retrieveTournamentDetails(req.params.tournamentId, req.params.userId).then(function(tournament){
		res.render('tournament/edit/ligi-turneu-info.ejs', {
			user: req.user,
			tournament: tournament,
			successMessage: req.flash('infoSuccess'),
			errorMessage: req.flash('infoError'),
			underscore: _
		});
	});
});

app.post('/ligi-turneu/:tournamentId/:userId', isLoggedIn, requireRole('Organizator'), function(req, res){
	Tournament.findById(req.params.tournamentId).populate('players').exec(function(err, tournament){
		tournament.openForLeagues.leagues.addToSet(req.body.leagues);

		tournament.save(function(err){
			if(err){
				req.flash('infoError', 'A aparut o eroare la modificarea ligilor pentru acest turneu');
				res.redirect('/ligi-turneu/' + req.params.tournamentId + '/' + req.params.userId );
			}else{
				req.flash('infoSuccess', 'Ligile au fost modificat cu succes!');
				res.redirect('/ligi-turneu/' + req.params.tournamentId + '/' + req.params.userId );
			}
		});
	});
});

app.get('/tournament-start-date/:tournamentId/:userId', isLoggedIn, requireRole('Organizator'), function(req, res){
	helperFunctions.retrieveTournamentDetails(req.params.tournamentId, req.params.userId).then(function(tournament){
		res.render('tournament/edit/start-date-info.ejs', {
			user: req.user,
			tournament: tournament,
			moment: moment,
			errorMessage: req.flash('infoError'),
			successMessage: req.flash('infoSuccess')
		});
	});
});

app.post('/tournament-start-date/:tournamentId/:userId', isLoggedIn, requireRole('Organizator'), function(req, res){
	Tournament.findById(req.params.tournamentId).exec(function(err, tournament){
		if(err){
			throw err;
		}

		tournament.startDate = req.body.startDate;
		tournament.save(function(err){
			if(err){
				req.flash('infoError', 'Nu am putut salva modificarile pentru noua data de incepere a turneului');
				res.redirect('/tournament-start-date/' + req.params.tournamentId + '/' + req.params.userId);
			}else{
				req.flash('infoSuccess', 'Salvarea unei noi date de incepere a turneului a fost facuta cu succes');
				res.redirect('/tournament-start-date/' + req.params.tournamentId + '/' + req.params.userId);
			}
		});
	});
});

app.get('/tournament-end-date/:tournamentId/:userId', isLoggedIn, requireRole('Organizator'), function(req, res){
	helperFunctions.retrieveTournamentDetails(req.params.tournamentId, req.params.userId).then(function(tournament){
		res.render('tournament/edit/end-date-info.ejs', {
			user: req.user,
			tournament: tournament,
			moment: moment,
			errorMessage: req.flash('infoError'),
			successMessage: req.flash('infoSuccess')
		});
	});
});

app.post('/tournament-end-date/:tournamentId/:userId', isLoggedIn, requireRole('Organizator'), function(req, res){
	Tournament.findById(req.params.tournamentId).exec(function(err, tournament){
		if(err){
			throw err;
		}

		tournament.endDate = req.body.endDate;
		tournament.save(function(err){
			if(err){
				req.flash('infoError', 'Nu am putut salva modificarile pentru noua data de finalizare a turneului');
				res.redirect('/tournament-end-date/' + req.params.tournamentId + '/' + req.params.userId);
			}else{
				req.flash('infoSuccess', 'Salvarea unei noi date de finalizare a turneului a fost facuta cu succes');
				res.redirect('/tournament-end-date/' + req.params.tournamentId + '/' + req.params.userId);
			}
		});
	});
});

app.get('/tournament-start-hour/:tournamentId/:userId', isLoggedIn, requireRole('Organizator'), function(req, res){
	helperFunctions.retrieveTournamentDetails(req.params.tournamentId, req.params.userId).then(function(tournament){
		res.render('tournament/edit/start-hour-info.ejs', {
			user: req.user,
			tournament: tournament,
			errorMessage: req.flash('infoError'),
			successMessage: req.flash('infoSuccess')
		});
	});
});

app.post('/tournament-start-hour/:tournamentId/:userId', isLoggedIn, requireRole('Organizator'), function(req, res){
	Tournament.findById(req.params.tournamentId).exec(function(err, tournament){
		if(err){
			throw err;
		}

		tournament.startHour = req.body.startHour;

		tournament.save(function(err){
			if(err){
				req.flash('infoError', 'Nu am putut salva modificarile pentru noua ora de incepere a turneului');
				res.redirect('/tournament-start-hour/' + req.params.tournamentId + '/' + req.params.userId);
			}else{
				req.flash('infoSuccess', 'Salvarea unei noi ore de inceperea a turneului a fost facuta cu succes');
				res.redirect('/tournament-start-hour/' + req.params.tournamentId + '/' + req.params.userId);
			}
		});
	});
});

app.get('/tournament-prizes/:tournamentId/:userId', isLoggedIn, requireRole('Organizator'), function(req, res){
	helperFunctions.retrieveTournamentDetails(req.params.tournamentId, req.params.userId).then(function(tournament){
		res.render('tournament/edit/tournament-prizes-info.ejs', {
			user: req.user,
			tournament: tournament,
			errorMessage: req.flash('infoError'),
			successMessage: req.flash('infoSuccess')
		});
	});
});

app.post('/tournament-prizes/:tournamentId/:userId', isLoggedIn, requireRole('Organizator'), function(req, res){
	Tournament.findById(req.params.tournamentId).exec(function(err, tournament){
		if(err){
			throw err;
		}

		tournament.prize = req.body.prize;
		tournament.save(function(err){
			if(err){
				req.flash('infoError', 'Nu am putut salva modificarile pentru acordarea de premii in cadrul acestui turneu');
				res.redirect('/tournament-prizes/' + req.params.tournamentId + '/' + req.params.userId);
			}else{
				req.flash('infoSuccess', 'Salvarea optiunii de premii a fost facut cu success!');
				res.redirect('/tournament-prizes/' + req.params.tournamentId + '/' + req.params.userId);
			}
		});
	});
});

app.get('/tournament-sponsors/:tournamentId/:userId', isLoggedIn, requireRole('Organizator'), function(req, res){
	helperFunctions.retrieveTournamentDetails(req.params.tournamentId, req.params.userId).then(function(tournament){
		res.render('tournament/edit/tournament-sponsors-info.ejs', {
			user: req.user,
			tournament: tournament,
			errorMessage: req.flash('infoError'),
			successMessage: req.flash('infoSuccess')
		});
	});
});

app.post('/tournament-sponsors/:tournamentId/:userId', isLoggedIn, requireRole('Organizator'), function(req, res){
	Tournament.findById(req.params.tournamentId).exec(function(err, tournament){
		if(err){
			throw err;
		}

		tournament.sponsors = req.body.sponsors;
		tournament.save(function(err){
			if(err){
				req.flash('infoError', 'Nu am putut salva modificarile pentru sponsorii acestui turneu');
				res.redirect('/tournament-sponsors/' + req.params.tournamentId + '/' + req.params.userId);
			}else{
				req.flash('infoSuccess', 'Salvarea sponsorilor a fost facuta cu success!');
				res.redirect('/tournament-sponsors/' + req.params.tournamentId + '/' + req.params.userId);
			}
		});
	});
});

//ruta pentru modificarea castigatorului


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

function requireMultipleUserRoles(role1, role2){
	return function(req, res, next){
		if(req.user.local.role === role1 || req.user.local.role === role2){
			next();
		}else{
			res.send(403);
		}
	}
}

function checkTournamentUpdatedProps(oldProp, updatedProp){
	if(oldProp == updatedProp){
		return 'Aceasta proprietate nu a fost modificata!' + '(' + oldProp + ')';
	}

	return updatedProp + '( a fost: ' + oldProp + ')';

}
