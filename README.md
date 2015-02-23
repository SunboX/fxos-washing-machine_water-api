OpenData Water API
==================

Based on Data by OpenData Heilbronn (https://github.com/opendata-heilbronn/trinkwasser).

Usage
-----

```bash
$ node server
```

Sample API Call
---------------

```txt
http://sunbox.local/water.json?latitude=49.1426930&longitude=9.2108790
```

Response:
```json
{
    "distance": 0.14553058919585077,
    "latitude": 49.1427395,
    "longitude": 9.2128784,
    "water": {
        "natrium": "5-6",
        "kalium": "1-2",
        "calcium": "48-52",
        "magnesium": "7-9",
        "chlorid": "8-9",
        "nitrat": "5-7",
        "sulfat": 32,
        "hardness": 9,
        "year": "2013",
        "description": ""
    }
}
```