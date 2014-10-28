var mongoose = require('mongoose');
var user = require('./user');
var tournament = require('./tournament');

var commentSchema = mongoose.Schema({
  commentText: String,
	parentTournament: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' }],
  user:[{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

module.exports = mongoose.model('Comment', commentSchema);