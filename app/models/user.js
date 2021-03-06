//ALWAYS REQUIRE MONGOOSE BEFORE ANY OTHER MODELS. IF NOT, YOU'LL GET OBJECT OBJECT DOES NOT HAVE SCHEMA DEFINED
var mongoose = require('mongoose');
var Tournament = require('./tournament.js');
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
    }],
    avatar: [{
      type: mongoose.Schema.Types.ObjectId, ref: "Avatar"
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

//create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);

