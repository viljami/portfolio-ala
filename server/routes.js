/* globals console */
var when = require('when');
var db = require('./db.js');

module.exports = function(app){

    app.get('/setup', db.setup);
    app.use(function(req, res, next){
        if (! db.ready()) return res.send('Site setup in progress.');
        next();
    });

    app.get('/', function(req,res){
        var home = db.getFrontPage();
        res.render('home-page', home);
    });

    app.get('/**/*.(txt|jpg|png|bmp|pdf|jpeg|gif)', function(req, res){
        when(db.getFile(req.path))
        .then(function(file){
            res.send(file);
        }, function(err){
            res.send('err', err);
        });
    });

    app.get('/**', function(req, res){
        var splitArray = /\//.exec(req.path);
        var projectName = splitArray[splitArray.length - 1];
        var project = db.getProject(projectName);
        res.render('project-page', project);
    });
};
