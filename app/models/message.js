/**
 * Created by cristiandrincu on 8/23/14.
 */
var mongoose = require('mongoose');
require('./user');

var messageSchema = mongoose.Schema({
  messageBody: String,
  sentBy: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }],
  receiver: [{
    type: mongoose.Schema.Types.ObjectId, ref:'User'
  }]
});

messageSchema.path('messageBody').validate(function(messageBody){
  return messageBody.length > 10
}, 'Mesajul trebuie sa contina minim 10 caractere');

module.exports = mongoose.model('Message', messageSchema);
