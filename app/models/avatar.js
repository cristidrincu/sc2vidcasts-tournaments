/**
 * Created by cristiandrincu on 9/20/14.
 */
var mongoose = require('mongoose');

var avatarSchema = mongoose.Schema({
  imageName: String,
  imageRaceCategory: String,
  imagePath: String
});

module.exports = mongoose.model('Avatar', avatarSchema);

