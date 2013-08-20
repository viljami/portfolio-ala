/* globals process, console */
var Dropbox = require('./dropbox.js');
var _ = require('lodash');
var when = require('when');

var _projects = [{
    title: '',
    client: '',
    time: '',
    brief: '',
    thumbnail: '',
    tags: [],
    images: []
}];

var _frontPage = {
    image: '',
    text: '',
    cvFile: '' // cv.pdf
};

var _fetchData = function(){};
var _dropbox = new Dropbox({
    app_key: process.env.DROPBOX_API_KEY,
    app_secret: process.env.DROPBOX_API_SECRET,
    scope: 'portfolio',
    setupReady: function(){
        // fetch the data and keep doing it
        _fetchData();
    }
});
_dropbox.connect();

var _processProject = function(name, files){
    if (! files || !files.length) return;

    console.log('PROCESS PROJECT: ', name, files);
    var rootDef = when.defer();
    var defs = [];
    var project = {
        title: name,
        client: '',
        time: '',
        brief: '',
        thumbnail: '',
        tags: [],
        images: []
    };

    _.each(files, function(file){
        var def = when.defer();
        defs.push(def.promise);
        if (/.txt$/i.test(file)){
            when(_dropbox.getFile(file))
            .then(function(fileString){
                var lines = fileString.split('\n');
                _.each(lines, function(line){
                    var projectProperty = line.split(':');
                    var key = _.first(projectProperty);
                    if (key === 'tags'){
                        project[key] = projectProperty.split(', ');
                    } else {
                        project[key] = _.rest(projectProperty).join(':');
                    }
                });
                def.resolve();
            });
        } else if (/thumbnail.(img|png|jpeg|bmp|gif)$/i.test(file)){
            project.thumbnail = file;
            def.resolve();
        } else if (/.(img|png|jpeg|bmp|gif)$/i.test(file)){
            project.images.push(file);
            def.resolve();
        }
    });
    when.all(defs)
    .then(function(){
        rootDef.resolve(project);
    });

    return rootDef.promise;
};

var _readDir = function(path){
    if (! path) return;

    var def = when.defer();
    when(_dropbox.readDir(path))
    .then(function(contents){
        def.resolve(contents);
    }, function(err){
        def.reject(err);
    });
    return def.promise;
};

var _fetchData = function(){
    var def = when.defer();
    console.log('fetchData -------------------------');
    when(_dropbox.readDir('/'))
    .then(function(files){
        var all = _.groupBy(files, function(file){
            var splitted = file.split('/');
            return splitted.length > 2 ? splitted[1] : '/';
        });
        console.log('all', all);
        var projects = _.first(all, function(val, key){
            console.log('VAL', val, key );
            return key !== '/' && key !== '_site';
        }, 9000);
        console.log('projects', projects);
        _.each(projects, function(val, key){
            when(_processProject(key, val))
            .then(function(project){
                _projects.push(project);
                console.log(project);
            });
        });

        var root = _.chain(all)
        .filter(function(val, key){
            return key === '/';
        })
        .map(function(val){
            return val;
        })
        .map(function(val){
            var obj = {};
            if (/^\/cv/.test(val)){
                obj.cv = val;
            } else {
                obj[val.split('/')[1]] = val;
            }
            return obj;
        });
console.log('root', root);
        var frontPage = {
            image: root['about.jpg'],
            text: '',
            cvFile: root.cv // cv.pdf
        };

        when(_dropbox.getFile(root['about.txt']))
        .then(function(fileString){
            console.log(fileString);
            frontPage.about.text = fileString;
            _frontPage = frontPage;
            console.log('frontpage, ' , _frontPage);
            def.resolve(frontPage);
        });

        _frontPage = frontPage;
    });

    return def.promise;
};

module.exports = {
    setup: function(req, res){
        if (_dropbox.isConnected()) return res.redirect('/');

        _dropbox.setup(req, res);
    },

    fetchData: _fetchData,

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
        return _.extend(_.clone(_frontPage), {projects: _.clone(_projects)});
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
    },

    readDir: _readDir
};
