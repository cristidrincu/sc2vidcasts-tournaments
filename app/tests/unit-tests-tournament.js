/**
 * Created by cristiandrincu on 10/21/14.
 */
var dbUri = 'mongodb://cristidrincu:crusader2@ds033400.mongolab.com:33400/tournament-unit-tests',
		should = require('chai').should(),
		mongoose = require('mongoose'),
		User = require('../models/user.js'),
		Tournament = require('../models/tournament.js'),
		clearDB = require('mocha-mongoose')(dbUri),
		moment = require('moment')
		;

var userGabi = new User({
	'local.nickname': 'gabi',
	'local.email': 'gabi@e-spres-oh.com',
	'local.race': 'Terran',
	'local.league' : 'Diamond',
	'local.battlenetid':  '7891',
	'local.role': 'admin',
	'local.website' : 'http://www.starcraft2-vidcasts.ro'
});

var tournamentTest = new Tournament({
	tournamentName: 'Turneu de test 1',
	nrOfPlayers: 5,
	edition: 2,
	description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed efficitur mollis eros, ac facilisis quam. Curabitur iaculis neque quis elit pellentesque, non mollis diam finibus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.',
	openForLeagues: {
		leagues: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grand Master']
	},
	startDate: null,
	endDate: null,
	startHour: '12:00',
	prize: false,
	sponsors: '',
	ingameChatChannel: 'sc2vid',
	twitchStreamChannel: 'warbringer81',
	players: [{
		type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

describe('A tournament', function(){
	beforeEach(function(done){
		if(mongoose.connection.db){
			return done();
		}

		mongoose.connect(dbUri, done);
	});

	it('can be saved', function(done){
		new Tournament({ tournamentName: 'Turneu de test 1', nrOfPlayers: 8, edition: 2, openForLeagues: {leagues: ['Bronze', 'Silver']} }).save(done());
	});

	it('can have its basic information updated', function(done){
		new Tournament({ tournamentName: 'Turneu de test modificat la titlu', nrOfPlayers: '20', edition: '10' }).save(function(err, newTournament){
			if(err) return done(err);

			newTournament.tournamentName.should.equal('Turneu de test modificat la titlu');
			newTournament.nrOfPlayers.should.equal('20');
			newTournament.edition.should.equal('10');
			done();
		});
	});

	it('can have its number of players updated', function(done){
		new Tournament({ nrOfPlayers: '10' }).save(function(err, newTournament){
			if(err) return done(err);

			newTournament.nrOfPlayers.should.equal('10');
			done();
		});
	});

	it('can have its leagues updated', function(done){
		new Tournament({tournamentName: 'Update tournament', openForLeagues: {leagues: ['Bronze', 'Silver']}}).save(function(err, model){
			if(err) return done(err);

			Tournament.findOne({tournamentName: 'Update tournament'}, function(err, tournament){
				if(err) return done(err);
				tournament.openForLeagues.leagues.splice(0, 1); //remove Bronze from leagues - bad structure: openForLeagues.leagues['Bronze', 'Silver'] - cannot use $pull on such a structure
				tournament.openForLeagues.leagues.length.should.equal(1);
				done();
			})
		})
	});

	it("can add a user to tournament", function(done){
		//add a user to the players array of a tournament
		new User({'local.nickname': 'userGabi'}).save(function(err){
			if(err) return done(err);

			User.findOne({'local.nickname': 'userGabi'}, function(err, user){
				if(err) return done(err);

				new Tournament({tournamentName: 'Turneu push user', players: []}).save(function(err){
					if(err) return done(err);

					Tournament.findOneAndUpdate({tournamentName: 'Turneu push user'}, {$push: {players: user}}, function(err, tournament){
						if(err) return done(err);
						tournament.players.length.should.equal(1);
						done();
					});
				});
			});
		});
	});

	it("can remove a user from tournament", function(done){
		new User({'local.nickname': 'userGabi'}).save(function(err){
			if(err) return done(err);

			User.findOne({'local.nickname': 'userGabi'}, function(err, user){
				if(err) return done(err);

				new Tournament({tournamentName: 'Turneu remove user', players: []}).save(function(err){
					if(err) return done(err);

					Tournament.findOneAndUpdate({tournamentName: 'Turneu remove user'}, {$push: {players: user}}, function(err){
						if(err) return done(err);

						Tournament.findOne({tournamentName: 'Turneu remove user'}).exec(function(err, tournament){
							if(err) return done(err);
							tournament.update({$pull: {players: user._id}}).exec(function(err){
								if(err) return done(err);
								Tournament.findOne({tournamentName: 'Turneu remove user'}, function(err, tournament){
									tournament.players.length.should.equal(0);
									done();
								});
							});
						});
					});
				});
			});
		});
	});

});
