/**
 * Created by cristiandrincu on 9/20/14.
 */
require('./user');
var mongoose = require('mongoose');

var avatarSchema = mongoose.Schema({
  imageName: String,
  imageRaceCategory: String,
  imagePath: String,
  users: [{
    type: mongoose.Schema.Types.ObjectId, ref: "User"
  }]
});

module.exports = mongoose.model('Avatar', avatarSchema);

