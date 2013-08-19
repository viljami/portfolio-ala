/* globals console */
var Dbox = require("dbox");
var _ = require('lodash');
var when = require('when');
var fs = require('fs');

var POLLING_INTERVAL_TIME = 5 * 1000;

var _dropboxTimeout;
var _dataFilePath = './data/.dropbox.data.json';
var _defaults = {
    app_key: 'your-key',
    app_secret: 'your-secret',
    root: 'dropbox',
    scope: '/'
};

module.exports = function(options){
    if (! options) options = {};

    var _api = _.extend({}, _defaults, options);
    var _dbox = Dbox.app(_api);
    var _client;
    var _account;
    var _paths = {};
    var _files = {};
    var _setupReadyCallback = options.setupReady;

    var defaultFileStructure = {
        '/about.txt': 'This is an example about me file.',
        '/about.jpg': '',
        '/cv-firstname-lastname.pdf': '',
        '/project1/project.txt': 'client: test-client\n brief: test-brief\n time: 1 day\n tag: test-tag\n',
        '/project1/01-example-image.jpg': '',
        '/project1/02-dashes-turn-spaces-for-image-name.jpg': '',
        '/project1/thumbnail.jpg': ''
    };

    var _setupPortfolio = function(){
        // If not exist:
        // Create portfolio folder if not existing
        _client.readdir('/', function(status, reply){
            console.log(reply);
            if (_.indexOf(reply, '/about.txt') == -1){
                _.each(defaultFileStructure, function(val, key){
                    _client.put(key, val, function(status, reply){
                        console.log(reply);
                    });
                });
            }
        });
        _setupReadyCallback();
    };

    var _pollUntilCredentials = function(){
        console.log('POLL 1');
        if (_dropboxTimeout) return;
        console.log('POLL 2');

        if (! _api.request_token){
            _dropboxTimeout = _.delay(function(){
                _dropboxTimeout = undefined;
                _pollUntilCredentials();
            }, POLLING_INTERVAL_TIME);
            return;
        }
        console.log('POLL 3');

        _dbox.accesstoken(_api.request_token, function(status, accessToken){
            if(! accessToken || /error/.test(_.keys(accessToken)[0])) {
                _dropboxTimeout = _.delay(function(){
                    _dropboxTimeout = undefined;
                    _pollUntilCredentials();
                }, POLLING_INTERVAL_TIME);
                return;
            }
            console.log('POLL 4');
            _api.access_token = accessToken ? accessToken : null;
            _saveJSON(_api);
            _client = _dbox.client(_api.access_token);
            _setupPortfolio();
        });
    };

    this.connect = function(){
        console.log('CONNECT 1');
        if (_client) return;
        console.log('CONNECT 2');

        var api = _loadJSON();
        if (api && api.access_token) {
            console.log('CONNECT 3');

            _api = api;
            _client = _dbox.client(_api.access_token);
            return;
        }
        console.log('CONNECT 4');

        _dbox.requesttoken(function(status, requestToken){
            _api.request_token = requestToken;
        });
    };

    this.setup = function(req, res){
        console.log('SETUP 1');
        if (_client) return res.redirect('/');
        console.log('SETUP 2');
        _pollUntilCredentials();
        return res.render('setup', { oauth_token: _api.request_token && _api.request_token.oauth_token });
    };

    this.getClient = function(){
        return _client;
    };

    this.isConnected = function(){
        return !! _client;
    };

    this.getAccount = function(){
        if (! _client) return;
        if (_account) return _account;

        var def = when.defer();
        _client.account(function(status, reply){
            _account = reply;
            def.resolve(_account);
        }, function(err){
            def.reject(err);
        });
        return def.promise;
    };

    this.readDir = function(path){
        if (! _client || ! path) return;
        // if (_.has(_paths, path)) return _paths[path];

        var def = when.defer();
        _client.readdir(path, function(status, reply){
            _paths[path] = reply;
            def.resolve(reply);
        }, function(err){
            def.reject(err);
        });
        return def.promise;
    };

    this.getFile = function(path, file){
        var def = when.defer();
        if (! _client || ! path) return;
        if (file) path += file;
        // if (_.has(_files, path)) {
        //     _.defer(function(){
        //         def.resolve(_files[path]);
        //     });
        // } else {
            _client.get(path, function(status, reply){
                _files[path] = reply;
                def.resolve(reply);
            });
        // }
        return def.promise;
    };

    var _saveJSON = function(json){
        fs.writeFileSync(_dataFilePath, JSON.stringify(json), {encoding: 'utf8'});
    };

    var _loadJSON = function(){
        if (! fs.existsSync(_dataFilePath)) return {};
        var jsonString = fs.readFileSync(_dataFilePath, {encoding: 'utf8'});
        return jsonString ? JSON.parse(jsonString) : {};
    };
};
