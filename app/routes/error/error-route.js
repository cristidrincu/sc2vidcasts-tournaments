/**
 * Created by cristiandrincu on 10/30/14.
 */
var express = require('express');
var app = module.exports = express();

app.get('/error', function(req, res){
    res.render('error-pages/error-forbidden-403.ejs', {
        user: req.user
    });
});
