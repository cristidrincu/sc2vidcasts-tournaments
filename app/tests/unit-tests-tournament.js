/**
 * Created by cristiandrincu on 10/21/14.
 */
var dbUri = 'mongodb://cristidrincu:crusader2@ds033400.mongolab.com:33400/tournament-unit-tests',
		should = require('chai').should(),
		mongoose = require('mongoose'),
		Tournament = require('../models/tournament.js'),
		clearDB = require('mocha-mongoose')(dbUri),
		moment = require('moment')
		;

var tournamentTest = new Tournament({
	tournamentName: 'Turneu de test 1',
	nrOfPlayers: 5,
	edition: 2,
	description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed efficitur mollis eros, ac facilisis quam. Curabitur iaculis neque quis elit pellentesque, non mollis diam finibus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.',
	openForLeagues: {
		"leagues": ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grand Master']
	},
	startDate: null,
	endDate: null,
	startHour: '12:00',
	prize: false,
	sponsors: '',
	ingameChatChannel: 'sc2vid',
	twitchStreamChannel: 'warbringer81'
});

describe('A tournament', function(){
	beforeEach(function(done){
		if(mongoose.connection.db){
			return done();
		}

		mongoose.connect(dbUri, done);
	});

	it('can have its basic information updated', function(done){
		tournamentTest.tournamentName = 'Turneu de test modificat la titlu';
		tournamentTest.nrOfPlayers = '20';
		tournamentTest.edition = '10';
		tournamentTest.description = 'Esti pregatit? ...speram ca da, pentru ca va trebui sa iti reprezinti rasa la cel mai inalt nivel. Acest concurs nu este unul clasic - este o lupta pe viata si pe moarte intre cele 3 rase din Starcraft2. Daca joci Terran, atunci intelegi ce inseamna supravietuirea in fata Swarm-ului. Zerg? Nu ai altceva de facut decat sa cresti economic - apoi... GO KILL. Iar daca joci Protoss, vei avea ocazia sa OBSERVI batalia - dupa care, va trebui sa iti murdaresti PSI BLADE-urile, fie pe terran, fie pe zerg!';


		tournamentTest.save(function(err, newTournament){
			if(err) return done(err);

			newTournament.tournamentName.should.equal('Turneu de test modificat la titlu');
			newTournament.nrOfPlayers.should.equal('20');
			newTournament.edition.should.equal('10');
			newTournament.description.should.equal('Esti pregatit? ...speram ca da, pentru ca va trebui sa iti reprezinti rasa la cel mai inalt nivel. Acest concurs nu este unul clasic - este o lupta pe viata si pe moarte intre cele 3 rase din Starcraft2. Daca joci Terran, atunci intelegi ce inseamna supravietuirea in fata Swarm-ului. Zerg? Nu ai altceva de facut decat sa cresti economic - apoi... GO KILL. Iar daca joci Protoss, vei avea ocazia sa OBSERVI batalia - dupa care, va trebui sa iti murdaresti PSI BLADE-urile, fie pe terran, fie pe zerg!');
			done();
		});
	});

	it('can have its number of players updated', function(done){
		tournamentTest.nrOfPlayers = '10';

		tournamentTest.save(function(err, newTournament){
			if(err) return done(err);

			newTournament.nrOfPlayers.should.equal('10');
			done();
		});
	});

	it('can have its leagues updated', function(done){
		tournamentTest.save(function(err){
			if(err) return done(err);
			tournamentTest.update( {'openForLeagues.leagues': "Bronze" }, { $pull: { 'openForLeagues.leagues': "Bronze" }}, function(err, recordsUpdated){
				if(err) return done(err);
				recordsUpdated.should.equal(1);
				done();
			});
		});
	});

//		tournamentTest.save(function(err, updatedTournament){
//			if(err) return done(err);
//			updatedTournament.openForLeagues.leagues.length.should.equal(3);
//			done();
//		})
});
