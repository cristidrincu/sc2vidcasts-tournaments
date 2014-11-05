/**
 * Created by cristiandrincu on 10/30/14.
 */

var mongoose = require('mongoose');
require('./user');

var quoteSchema = mongoose.Schema({
	quoteInsertedBy: [{
		type: mongoose.Schema.Types.ObjectId, ref:'User'
	}],
	quoteText: String,
	quoteAuthor: String
});

module.exports = mongoose.model('Quote', quoteSchema);
