/**
 * Created by cristiandrincu on 7/28/14.
 */
var express = require('express');
var fs = require('fs');
var helperFunctions = require('./helpers-mongoose');
module.exports = function (app) {

  /*RULES FOR ACCESS*/
  app.all('/profile/*', isLoggedIn);
  app.all('/customize-profile/*', isLoggedIn);


  app.get('/upload-avatar', isLoggedIn, requireRole('admin'), function(req, res){
    helperFunctions.retrieveAllTournaments(function(tournaments){
      res.render('backend/admin-upload-avatars.ejs', {
        user: req.user,
        tournaments: tournaments
      });
    });
  });

  //TODO - PARTEA DE UPLOAD VA PUTEA FI FOLOSITA DOAR DE CATRE ADMIN. USERII NU VOR PUTEA SA ISI INCARCE AVATARURI - VOR PUTEA SA ALEAGA DINTR-O COLECTIE DE AVATARE PENTRU FIECARE RASA
  //TODO - LA MODELUL DE USER VA TREBUI SA BAGAM SI UN PATH CATRE IMAGINE(SI IN MONGO), DUPA CE SI-O ALEGE DIN COLECTIA DE AVATARE
  //TODO - avatarele o sa fie in 2 dimensiuni: 200x200 pentru pagina de turnee, 100x100 pentru pagina de profil
  app.post('/upload-avatar', isLoggedIn, requireRole('admin'), function(req, res){
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function(fieldname, file, filename){
      console.log('Uploading: ' + filename);
      fstream = fs.createWriteStream(__dirname + '/../public/uploads/user-profile-images/' + filename);
      file.pipe(fstream);
      fstream.on('close', function(err){
        if(err){
          console.log(err);
        }else{
          res.redirect('/backend-admin');
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
