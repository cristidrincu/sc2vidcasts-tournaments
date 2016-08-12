var helperFunctions = require('../helpers-mongoose.js');

exports.userAvatarDetails = function(userId) {
    helperFunctions.getUserDetails(userId).then(function (user) {
        return user;
    });
};