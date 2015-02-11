var mongoose = require('mongoose');

//define the schema for our tournament model
var tournamentSchema = mongoose.Schema({
    tournamentName: String,
    nrOfPlayers: String,
    players: [{
      type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    openForLeagues: {
        "leagues" : []
    },
    organizer: [{
      type: mongoose.Schema.Types.ObjectId, ref: "User"
    }],
		winner: [{
			type: mongoose.Schema.Types.ObjectId, ref: "User"
		}],
    edition: String,
    description: String,
    startDate: Date,
    endDate: Date,
    startHour: String,
    prize: Boolean,
    sponsors: String,
    ingameChatChannel: String,
    twitchStreamChannel: String,
		finishedTournament: Boolean
});

tournamentSchema.path('tournamentName').validate(function(tournamentName){
  return tournamentName.length > 4
}, 'Numele turneului trebuie sa contina mai mult de 4 caractere');

tournamentSchema.path('description').validate(function(description){
  return description.length > 10
}, 'Descrierea turneului trebuie sa contina minim 100 de caractere');

tournamentSchema.path('ingameChatChannel').validate(function(ingameChatChannel){
  return ingameChatChannel.length > 4
}, 'Numele canalului de chat trebuie sa contina minim 4 caractere');

//create the model for users and expose it to our app
module.exports = mongoose.model('Tournament', tournamentSchema);

