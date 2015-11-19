var mongoose = require('mongoose');
var User = require('./../models/user.js');

exports.onSignup = function(email, done, req, password){

    req.session.userCompletedFormValues = {
        userEmail: req.body.email,
        userNickname: req.body.nickname,
        userAccount: req.body.role,
        userBNetId: req.body.battlenetid,
        userRace: req.body.race,
        userLeague: req.body.league
    };

    User.findOne({
                    $or: [ {'local.email': email}, {'local.nickname': req.body.nickname}, {'local.battlenetid': req.body.battlenetid} ]
    }, function (err, user) {
        if (err)
            return done(err);

        if (user) {
            if(user.local.email === email) {
                return done(null, false, req.flash('error', email + ' : Deja exista un utilizator cu aceasta adresa de email!'));
            }
            if(user.local.nickname === req.body.nickname) {
                return done(null, false, req.flash('error', req.body.nickname + ' : Deja exista un utilizator cu acest nickname!'));
            }
            if(user.local.battlenetid === req.body.battlenetid) {
                return done(null, false, req.flash('error', req.body.battlenetid + ' : Deja exista un utilizator cu acest battlenet id!'));
            }

            //TODO - add these validations to jquery script
            //if (!utils.validateEmail(email)) {
            //    return done(null, false, req.flash('emailInvalid', email + ' : Adresa de email nu este una valabila! '));
            //}
            //
            ////validate nickname - if not valid, stop signup process
            //if (!utils.validateNickname(req.body.nickname)) {
            //    var nickname = req.body.nickname;
            //    return done(null, false, req.flash('error', nickname + ' : Nickname-ul ales nu a putut fi validat! Minim 3 caractere, maxim 30 caractere '));
            //}
            //
            ////validate battlenet id - if not valid, stop signup process
            //if (!utils.validateBNetId(req.body.battlenetid)) {
            //    var battlenetId = req.body.battlenetid;
            //    return done(null, false, req.flash('error', battlenetId + ' : ID-ul pentru Battlenet nu este valid!'));
            //}

        } else {
            var newUser = new User();

            if (req.body.password == req.body.PasswordAgain) {
                newUser.local.password = newUser.generateHash(password);
            } else {
                return done(null, false, req.flash('error', 'Parolele nu sunt identice!'));
            }

            // set the user's local credentials
            newUser.local.email = email;
            newUser.local.race = req.body.race;
            newUser.local.league = req.body.league;
            newUser.local.nickname = req.body.nickname;
            newUser.local.battlenetid = req.body.battlenetid;
            newUser.local.role = req.body.role;
            newUser.local.website = req.body.website;
            newUser.local.avatar[0] = req.body.defaultAvatar;

            // save the user
            newUser.save(function (err) {
                if (err)
                    throw err;
                return done(null, newUser, req.flash('signupSuccess', 'Contul a fost creat cu succes!'));
            });
        }
    });
};

exports.onLogin = function(email, done, req, password) {
    User.findOne({'local.email': email}, function (err, user) {
        // if there are any errors, return the error before anything else
        if (err)
            return done(err);

        // if no user is found, return the message
        if (!user)
            return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

        // if the user is found but the password is wrong
        if (!user.isValid(password))
            return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

        // all is well, return successful user
        return done(null, user);
    });
};