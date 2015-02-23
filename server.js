<<<<<<< HEAD
var fs = require('fs'),
	path = require('path'),
	url = require('url'),
	mime = require('mime'),
	http = require('http'),
	os = require('os'),
	sgl = require('simplegeoloc'),
	waterData = require('./data/water.json'),
	port = 8080;

var store = sgl.createStore();

for (var i = 0, len = waterData.length; i < len; i++) {
	store.add(
		waterData[i].latitude,
		waterData[i].longitude,
		waterData[i].item
	);
}

var getEncoding = function (buffer, opts) {
	var binaryEncoding, charCode, chunkBegin, chunkEnd, chunkLength, contentChunkUTF8, encoding, i, textEncoding, _i, _ref;
	textEncoding = 'utf8';
	binaryEncoding = 'binary';
	if (opts == null) {
		chunkLength = 24;
		encoding = getEncoding(buffer, {
			chunkLength: chunkLength,
			chunkBegin: chunkBegin
		});
		if (encoding === textEncoding) {
			chunkBegin = Math.max(0, Math.floor(buffer.length / 2) - chunkLength);
			encoding = getEncoding(buffer, {
				chunkLength: chunkLength,
				chunkBegin: chunkBegin
			});
			if (encoding === textEncoding) {
				chunkBegin = Math.max(0, buffer.length - chunkLength);
				encoding = getEncoding(buffer, {
					chunkLength: chunkLength,
					chunkBegin: chunkBegin
				});
			}
		}
	} else {
		chunkLength = opts.chunkLength, chunkBegin = opts.chunkBegin;
		if (chunkLength == null) {
			chunkLength = 24;
		}
		if (chunkBegin == null) {
			chunkBegin = 0;
		}
		chunkEnd = Math.min(buffer.length, chunkBegin + chunkLength);
		contentChunkUTF8 = buffer.toString(textEncoding, chunkBegin, chunkEnd);
		encoding = textEncoding;
		for (i = _i = 0, _ref = contentChunkUTF8.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
			charCode = contentChunkUTF8.charCodeAt(i);
			if (charCode === 65533 || charCode <= 8) {
				encoding = binaryEncoding;
				break;
			}
		}
	}
	return encoding;
};

var server = http.createServer(function (request, response) {
	var urlParts = url.parse(request.url, true),
		pathname = urlParts.pathname;
	query = urlParts.query;

	switch (pathname) {
	case '/':
		var str = 'hello.';

		var date = new Date().toUTCString(),
			encoding = getEncoding(str);

		response.writeHead(200, {
			'Content-Type': mime.lookup('index.html'),
			'Last-Modified': date,
			'Pragma': 'public',
			'Cache-Control': 'public, max-age=0',
			'Expires': date,
			'Content-Length': Buffer.byteLength(str, encoding)
		});

		response.write(str, encoding);
		break;

	case '/water.json':

		var json;

		if (!query.latitude && !query.longitude) {
			var json = '{"msg":"please provide a latitude and longitude parameter"}';
		} else {
			var nearest = store.next(parseFloat(query.latitude), parseFloat(query.longitude));
			json = JSON.stringify({
				distance: nearest.distance,
				latitude: parseFloat(nearest.latitude),
				longitude: parseFloat(nearest.longitude),
				water: nearest.item
			});
		}

		var date = new Date().toUTCString(),
			encoding = getEncoding(json);

		response.writeHead(200, {
			'Content-Type': mime.lookup(urlParts.pathname),
			'Last-Modified': date,
			'Pragma': 'public',
			'Cache-Control': 'public, max-age=0',
			'Expires': date,
			'Content-Length': Buffer.byteLength(json, encoding)
		});

		response.write(json, encoding);
		break;
	}

	response.end();
});

server.listen(port);

console.log('---------------------------------------------');
console.log('Server listening at http://' + os.hostname().toLowerCase() + ':' + port + '/');
console.log('---------------------------------------------');
=======
#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');


/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express.createServer();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

>>>>>>> 5f7d82144c81f1ec96c24b289e3227f5aaad2dd6
