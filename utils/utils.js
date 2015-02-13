/**
 * Created by cristiandrincu on 2/12/15.
 */
exports.validateEmail = function(email){
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

exports.validateBNetId = function(bnet){
	var re = /^[0-9]+$/;
	return re.test(bnet);
}

exports.validateNickname = function(nickname){
	var re = /^[a-zA-Z0-9]{3,10}$/;
	return re.test(nickname);
}