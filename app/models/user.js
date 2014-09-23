require('./avatar');
require('./tournament');
var tournament = require('./tournament');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

//define the schema for our user model
var userSchema = mongoose.Schema({

  local : {
    nickname: String,
    battlenetid: String,
    email: String,
    password: String,
    race: String,
    league: String,
    role: String,
    website: String,
    avatarImage: String,
    tournaments: [{
       type: mongoose.Schema.Types.ObjectId, ref: "Tournament"
    }]
  }
});

//generating a hash
userSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//checking if password is valid
userSchema.methods.isValid = function(password){
  return bcrypt.compareSync(password, this.local.password);
};

userSchema.pre('remove', function(userId, next){
  tournament.update(
      { 'tournamentName': 'Battle of the Races' },
      { $pull: { 'players': { _id: userId } } },
      { multi: true },
      console.log('user removed from tournament'),
      next(new Error('Could not delete user from tournament'))
  );
});

//create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);

