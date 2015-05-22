/**
 * Created by cristiandrincu on 3/24/15.
 */
var nodeMailer = require('nodemailer');

//nodemailer SMTP transporter - used to notify players that a new tournament has been created and to send tournament brackets link
var transporter = nodeMailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'starcraft2vidcasts@gmail.com',
		pass: 'crusader22012'
	}
})

exports.newTournamentCreated = function(players, tournament){
	players.forEach(function(player){
		transporter.sendMail({
			from: 'Starcraft2 Turnee Romania',
			to: player.local.email,
			subject: 'Salut, un nou turneu a fost creat: ' + tournament.tournamentName,
			text: 'Turneul \'' + tournament.tournamentName + '\' pentru ligile ' + tournament.openForLeagues.leagues.toString() + ' te asteapta. Logheaza-te in aplicatie pentru a afla mai multe detalii!'
		})
	})
};

exports.sendBracketsToTournamentPlayers = function(players, tournamentName, tournamentBracketLink, cb) {
	players.forEach(function(player){
		transporter.sendMail({
			from: 'Starcraft2 Turnee Romania',
			to: player.local.email,
			subject: 'Salut, au fost generate bracket-urile pentru turneul ' + tournamentName + '. Logheaza-te in aplicatie pentru a afla mai multe detalii!',
			text: 'Click pe link-ul de mai jos pentru a accesa brackets-urile pentru turneul in care participi: </br> ' + tournamentBracketLink
		}, function(error){
			cb(error);
		})
	});
};