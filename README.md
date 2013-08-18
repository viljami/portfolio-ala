Portfolio Ala
=============

Node.js - Dropbox API - Express - Heroku

Simple Node.js portfolio site deployable on Heroku, serving files from Dropbox and using following node.js modules:

* express
* dbox
* when
* lodash

Heroku requires some environmental variables:

* DROPBOX_API_KEY
* DROPBOX_API_SECRET

On deployed site it is recommended to use following env:

* NODE_ENV=production

Express really likes it.

Development
===========

Some basic Grunt automation is set:

    grunt watch

* less -> css
* client .js -> min.js


Copyright
=========

Copyright 2013 Viljami Peltola

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
