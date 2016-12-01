global.$ = require('jquery')

var config = require('./config')
var mapboxgl = require('mapbox-gl')
var city = require('./city')
var speed = 100

var draw = {
  point: function point (id, coordinates, color) {

    city.map.addSource(id, {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': [{
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': coordinates
          }
        }]
      }
    })

    city.map.addLayer({
      'id': id,
      'source': id,
      'type': 'circle',
      'paint': {
        'circle-radius': config.normalSize,
        'circle-color': color
      }
    })
  },
  remove: function remove (id) {
    city.map.removeLayer(id)
    city.map.removeSource(id)
  },
  route: function route (data, cb) {
    var newPosition = {
        'type': 'Point',
        'coordinates': []
      },
      i = 0,
      steps = data.route.geometry.coordinates.length,
      animation = {}

      // console.log('data.route.geometry.coordinates')
      // console.log(data.route.geometry.coordinates)

      if(data.route.geometry.coordinates !== undefined) {

        // Animate route
        if (data.animate == true) {
          animation = setInterval(function () {

            newPosition.coordinates = data.route.geometry.coordinates[i]

            // Animate Driver
            city.map.getSource(data.driver.id).setData(newPosition)

            i++

            if (i > steps) {
              clearInterval(animation)
              // console.log('asdfasdfas')
              if(data.rider && newPosition) {
                console.dir(data)
                console.dir(newPosition)
                city.map.getSource(data.rider.id).setData(newPosition)
              }
              setTimeout(function () {
                cb()
              }, 1000)
            }
          }, speed)

          // Draw route without animation
        } else {

          city.map.addSource(data.routeId, {
            'type': 'geojson',
            'data': {
              'type': 'Feature',
              'properties': {},
              'geometry': {
                'type': 'LineString',
                'coordinates': data.route.geometry.coordinates
              }
            }
          })

          city.map.addLayer({
            'id': data.routeId,
            'type': 'line',
            'source': data.routeId,
            'layout': {},
            'paint': {
              'line-color': config.workColor,
              'line-width': 2,
              'line-dasharray': [2, 1]
            }
          })

          cb()
        }

      }
  },
  activateDriver: function activateDriver (driverId) {
    city.map.setPaintProperty(driverId, 'circle-radius', 20)
    // city.map.setPaintProperty(driverId, "circle-stroke-width", 10)
    // city.map.setPaintProperty(driverId, "circle-stroke-color ", config.driverColor)
    city.map.setPaintProperty(driverId, 'circle-color', config.driverColor)
  },
  deActivateDriver: function deActivateDriver (driverId) {
    city.map.setPaintProperty(driverId, 'circle-radius', config.normalSize)
    // city.map.setPaintProperty(driverId, "circle-stroke-width", 0)
    city.map.setPaintProperty(driverId, 'circle-color', config.driverColor)
  },
  waitingRider: function waitingRider (riderId) {
    city.map.setPaintProperty(riderId, 'circle-color', config.waitColor)
  },
  activateRider: function activateRider (riderId) {
    city.map.setPaintProperty(riderId, 'circle-opacity', 1)
    city.map.setPaintProperty(riderId, 'circle-radius', 25)
  },
  deActivateRider: function deActivateRider (riderId) {
    city.map.setPaintProperty(riderId, 'circle-opacity', 0)
    city.map.setPaintProperty(riderId, 'circle-radius', 0)
  }
}

module.exports = draw
