var fs = require('fs'),
	path = require('path'),
	nominatim = require('nominatim');

var tw = {
	data: {}
};

// Include data from opendata-heilbronn/trinkwasser
eval(fs.readFileSync(path.join(__dirname, 'data', 'opendata-heilbronn_trinkwasser', 'src', 'data', 'locations.js')) + '');
eval(fs.readFileSync(path.join(__dirname, 'data', 'opendata-heilbronn_trinkwasser', 'src', 'data', 'zones.js')) + '');

// Include utils from opendata-heilbronn/trinkwasser
eval(fs.readFileSync(path.join(__dirname, 'data', 'opendata-heilbronn_trinkwasser', 'src', 'js', 'utils.js')) + '');

var convertedData = [],
	requestCount = 0;

// Pull geo locations from OpenStreetMap for opendata-heilbronn/trinkwasser
var cities1 = Object.keys(tw.data.locations);
for (var i = 0, iLen = cities1.length; i < iLen; i++) {
	var city1 = cities1[i];
	var zoneKeys = [
        city1
    ];
	var cities2 = Object.keys(tw.data.locations[city1]);
	for (var j = 0, jLen = cities2.length; j < jLen; j++) {
		var city2 = cities2[j];
		if (city2 !== '') {
			zoneKeys.push(city1 + ' ' + city2);
		}
		var city = city2 === '' ? city1 : city2 + ', ' + city1;
		var zones = Object.keys(tw.data.locations[city1][city2]);
		for (var k = 0, kLen = zones.length; k < kLen; k++) {
			var zone = zones[k];
			if (zone !== '') {
				zoneKeys.push(
					(city2 === '' ? city1 : city1 + ' ' + city2) +
					' ' + zone
				);
			}
			var streets = tw.data.locations[city1][city2][zone];
			for (var l = 0, lLen = streets.length; l < lLen; l++) {
				var street = streets[l];
				if (street !== '') {
					zoneKeys.push(
						(city2 === '' ? city1 : city1 + ' ' + city2) +
						(zone === '' ? '' : ' ' + zone) +
						' ' + street
					);
				}
				var options = {
					street: street,
					city: city,
					country: 'Germany'
				};
				requestCount++;
				process.stdout.write('Requests running: ' + requestCount + '\033[0G');
				nominatim.search(options, function (zoneKeys, err, opts, results) {
					requestCount--;
					process.stdout.write('Requests running: ' + requestCount + '\033[0G');
					if (results.length > 0) {
						var location = results[0];
						for (var m = 0, mLen = zoneKeys.length; m < mLen; m++) {
							var key = zoneKeys[m];
							if (tw.data.zones[key]) {
								convertedData.push({
									latitude: location.lat,
									longitude: location.lon,
									item: tw.data.zones[key]
								});
							}
						}
					}
					if (requestCount === 0) {
						fs.writeFile(path.join(__dirname, 'data', 'water.json'), JSON.stringify(convertedData), function (err) {
							if (err) {
								console.log(err);
							} else {
								console.log('The file was saved!');
							}
						});
					}
				}.bind(null, zoneKeys));
			}
		}
	}
}