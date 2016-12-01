var city = require('./city')
var Chance = require('chance')
var chance = new Chance()

var utilities = {
  getRandomPoint: function getRandomPoint () {
    var location = {
      point: {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [chance.longitude({
            min: city.bounds._sw.lng,
            max: city.bounds._ne.lng
          }), chance.latitude({
            min: city.bounds._sw.lat,
            max: city.bounds._ne.lat
          })]
        }
      }
    }

    return location
  }
}

module.exports = utilities
