/* globals process */
var Dropbox = require('./dropbox.js');
var _ = require('lodash');
var when = require('when');

var _projects = {
        images: [],

};
var _frontPage = {
    projects: _projects,
    about: {
        image: '',
        text: '',
        file: '' // cv.pdf
    }
};
var _dropbox = new Dropbox({
    app_key: process.env.DROPBOX_API_KEY,
    app_secret: process.env.DROPBOX_API_SECRET,
    scope: 'portfolio',
    setupReady: function(){
        // fetch the data and keep doing it
    }
});

_dropbox.connect();

module.exports = {
    setup: function(req, res){
        if (_dropbox.isConnected()) return res.redirect('/');

        _dropbox.setup(req, res);
    },

    ready: function(){
        return _dropbox.isConnected();
    },

    getProjects: function(){
        return _projects;
    },

    getProject: function(name) {
        return _.has(_projects, name) ? _projects[name] : {};
    },

    getFrontPage: function(){
        return _.extend(_frontPage, {projects: _projects});
    },

    getFile: function(path, file){
        if (! path) return;
        if (file) path += file;

        var def = when.defer();
        when(_dropbox.getFile(path))
        .then(function(file){
            def.resolve(file);
        }, function(err){
            def.reject(err);
        });
        return def.promise;
    }
};
