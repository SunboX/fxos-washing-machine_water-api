var fs = require('fs'),
	path = require('path'),
	url = require('url'),
	mime = require('mime'),
	http = require('http'),
	os = require('os'),
	sgl = require('simplegeoloc'),
	waterData = require('./data/water.json'),
	port = process.env.OPENSHIFT_NODEJS_PORT || 8080,
	ipaddress = process.env.OPENSHIFT_NODEJS_IP;

if (typeof ipaddress === 'undefined') {
	//  Log errors on OpenShift but continue w/ 127.0.0.1 - this
	//  allows us to run/test the app locally.
	console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
	ipaddress = '127.0.0.1';
}

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

server.listen(port, ipaddress);

console.log('---------------------------------------------');
console.log('Server listening at http://' + os.hostname().toLowerCase() + ':' + port + '/');
console.log('---------------------------------------------');