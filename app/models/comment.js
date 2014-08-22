var mongoose = require('mongoose');
var user = require('./user');

var commentSchema = mongoose.Schema({
  commentContent: String,
  user:[{type: mongoose.Types.ObjectId, ref: 'User'}]
});

module.exports = mongoose.model('Comment', commentSchema);