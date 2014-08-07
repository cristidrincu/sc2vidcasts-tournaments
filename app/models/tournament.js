var mongoose = require('mongoose');

//define the schema for our user model
var tournamentSchema = mongoose.Schema({
    tournamentName: String,
    nrOfPlayers: String,
    edition: String,
    description: String,
    startDate: Date,
    endDate: Date,
    startHour: String,
    prize: Boolean,
    sponsors: String
});

//create the model for users and expose it to our app
module.exports = mongoose.model('Tournament', tournamentSchema);

