/**
 * Created by cristiandrincu on 10/15/14.
 */
var dbUri = 'mongodb://cristidrincu:crusader2@ds033400.mongolab.com:33400/tournament-unit-tests',
		should = require('chai').should(),
		mongoose = require('mongoose'),
		User = require('../models/user.js'),
		clearDB = require('mocha-mongoose')(dbUri)
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

var userCristi = new User({
	'local.nickname': 'cristian',
	'local.email': 'cristian@e-spres-oh.com',
	'local.race': 'Terran',
	'local.league' : 'Diamond',
	'local.battlenetid':  '7891',
	'local.role': 'admin',
	'local.website' : 'http://www.starcraft2-vidcasts.ro'
});

var userTest = new User({
	'local.nickname' : 'userTest',
	'local.email' : 'usertest@test.com',
	'local.race': 'Terran',
	'local.league' : 'Diamond',
	'local.battlenetid':  '7891',
	'local.role' : 'admin',
	'local.website' : 'http://www.starcraft2-vidcasts.ro'
});

userGabi.local.password = userGabi.generateHash('crusader2');
userCristi.local.password = userCristi.generateHash('crusader4');
userTest.local.password = userTest.generateHash('crusader2');

describe("A user model", function(){
	beforeEach(function(done){
		if(mongoose.connection.db){
			return done();
		}

		mongoose.connect(dbUri, done);
	});

	it("can be saved", function(done){
		userGabi.save(done);
	});

	it("can be read", function(done){
		var docLength = 0;
		userGabi.save(function(err){
			if(err) return done(err);
			docLength++;
			userCristi.save(function(err){
				if(err) return done(err);
				docLength++;
				User.find({}, function(err){
					if(err) return done(err);
					docLength.should.equal(2);
					done();
				});
			});
		});
	});

	it("can be updated", function(done){

		userCristi.local.nickname = 'cristian2';
		userCristi.local.email = 'warbringer@starcraft2-vidcasts.ro';
		userCristi.local.race = 'Zerg';
		userCristi.local.league = 'Grand Master';
		userCristi.local.battlenetid = '0000';
		userCristi.local.role = 'admin';
		userCristi.local.website = 'http://www.globe-studios.com';
		var oldPassword = userCristi.local.password;
		var newPassword = userCristi.local.password = userCristi.generateHash('crusader3');


		userCristi.save(function(err, cristi){
			if(err) return done(err);
			cristi.local.nickname.should.equal('cristian2');
			cristi.local.email.should.equal('warbringer@starcraft2-vidcasts.ro');
			cristi.local.race.should.equal('Zerg');
			cristi.local.league.should.equal('Grand Master');
			cristi.local.battlenetid.should.equal('0000');
			cristi.local.role.should.equal('admin');
			cristi.local.website.should.equal('http://www.globe-studios.com');
			oldPassword.should.not.equal(newPassword);
			done();
		});
	});

	it("can be deleted", function(done){
		var docsLength = 0;
		userCristi.save(function(err){
			if(err) return done(err);
			docsLength ++;

			User.find( {} ).exec(function(err){
				if(err) return done(err);
				docsLength.should.equal(1);
				User.remove( {'local.nickname' : 'cristian'} ).exec(function(err){
					if(err) return done(err);
					User.count(function(err, count){
						count.should.equal(0);
						done();
					});
				});
			});
		});
	});

});
