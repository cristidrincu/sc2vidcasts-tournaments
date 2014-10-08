/**
 * Created by cristiandrincu on 7/28/14.
 */
var express = require('express');
var fs = require('fs');
var helperFunctions = require('./helpers-mongoose');
var Avatar = require('./models/avatar.js');

module.exports = function (app) {

  /*RULES FOR ACCESS*/
  app.all('/profile/*', isLoggedIn);
  app.all('/customize-profile/*', isLoggedIn);


  app.get('/upload-avatar/:userId', isLoggedIn, requireRole('admin'), function(req, res){
    helperFunctions.getUserDetails(req.params.userId).then(function(user){
      helperFunctions.retrieveAllTournaments().then(function(tournaments){
        res.render('backend/admin-upload-avatars.ejs', {
          user: req.user,
          avatarUser: user,
          tournaments: tournaments
        });
      });
    });
  });

  app.post('/upload-avatar', isLoggedIn, requireRole('admin'), function(req, res){

    var avatarRaceCategory = null;

    req.busboy.on('field', function(fieldname, value){
      avatarRaceCategory = value;
      return avatarRaceCategory;
    });

    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function(fieldname, file, filename){
      console.log('Uploading: ' + filename);
      fstream = fs.createWriteStream(__dirname + '/../public/uploads/user-profile-images/' + avatarRaceCategory + '/' + filename);
      file.pipe(fstream);
      fstream.on('close', function(err){
        if(err){
          console.log(err);
        }else{
          Avatar.findOne({ 'imageName': filename }).exec(function(err, avatar){
            if(avatar){
              res.redirect('/backend-admin')
            }else{
              var newAvatarImage = new Avatar();
              newAvatarImage.imageName = filename;
              newAvatarImage.imageRaceCategory = avatarRaceCategory;
              newAvatarImage.imagePath = '/uploads/user-profile-images/' + avatarRaceCategory;
              newAvatarImage.save(function(err){
                if(err)
                  throw err;
                res.redirect('/backend-admin/' + req.user._id);
              });
            }
          });

        }
      })
    });
  });
};

/*ROUTE MIDDLEWARE - MAKE SURE A USER IS LOGGED IN*/
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}

function requireRole(role){
  return function(req, res, next){
    if(req.user.local.role === role){
      next();
    }
    else{
      res.send(403);
    }
  }
}
