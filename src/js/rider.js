var config = require('./config')

function rider (startPosition, id, name) {
  return {
    point: {
      'type': 'Feature',
      'properties': {
        'marker-color': config.riderColor
      },
      'geometry': {
        'type': 'Point',
        'coordinates': startPosition
      }
    },
    id: id,
    name: name,
    shares: 0,
    trips: 0,
    percentage: 0,
    waiting: false,
    inTransit: false
  }
}

module.exports = rider
