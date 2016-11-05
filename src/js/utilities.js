/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

var city = require("./city"),
    Chance = require('chance'),
    chance = new Chance();

var utilities = {
  getRandomPoint: function getRandomPoint() {
        
    var location = {
      point: {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [chance.longitude({
            min: city.bounds._sw.lng,
            max: city.bounds._ne.lng,
          }), chance.latitude({
            min: city.bounds._sw.lat,
            max: city.bounds._ne.lat,
          })]
        }
      }
    };

    return location;

  }
}

module.exports = utilities;
