/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

// Require jQuery
global.$ = require("jquery");

var ledger = require("./ledger"),
  mapboxgl = require('mapbox-gl'),
  moment = require('moment'),
  city = require("./city");

require("moment-duration-format");

var draw = {
  point: function point(id, coordinates, color) {

    city.map.addSource(id, {
      "type": "geojson",
      "data": {
        "type": "FeatureCollection",
        "features": [{
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": coordinates
          }
          }]
      }
    });

    city.map.addLayer({
      "id": id,
      "source": id,
      "type": "circle",
      "paint": {
        "circle-radius": 15,
        "circle-color": color,
        "circle-blur": 0.5
      }
    });

  },
  remove: function remove(id) {

    city.map.removeLayer(id);
    city.map.removeSource(id);

  },
  driver: function driver(driver) {

    $('#drivers-table').append('<tr id="' + driver.id + '" class="' + driver.id + '"><td>' + driver.name + '</td><td class="trips">0</td><td class="shares">0</td><tr>');

  },
  rider: function rider(rider) {

    $('#riders-table').append('<tr id="' + rider.id + '" class="' + rider.id + '"><td>' + rider.name + '</td><td class="trips">0</td><td class="shares">0</td><tr>');

  },
  route: function route(data, cb) {

    var newPosition = {
        "type": "Point",
        "coordinates": []
      },
      i = 0,
      steps = data.route.geometry.coordinates.length,
      animation = {},
      speed = 100;

    // Animate route
    if (data.animate == true) {

      animation = setInterval(function () {

        newPosition.coordinates = data.route.geometry.coordinates[i];

        city.map.getSource(data.driver.id).setData(newPosition);

        i++;

        if (i > steps) {
          clearInterval(animation);
          setTimeout(function () {
            cb();
          }, 1000);
        }
      }, speed);

      // Draw route without animation
    } else {

      //      console.log('coords', data.route.geometry.coordinates);

      city.map.addSource(data.routeId, {
        "type": "geojson",
        "data": {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "LineString",
            "coordinates": data.route.geometry.coordinates
          }
        }
      });

      city.map.addLayer({
        "id": data.routeId,
        "type": "line",
        "source": data.routeId,
        "layout": {
          "line-join": "round",
          "line-cap": "round"
        },
        "paint": {
          "line-color": '#f00',
          "line-width": 4,
          "line-opacity": 0.5
        }
      });

      cb();

    }

  },
  activateDriver: function activateDriver(driverId) {
    city.map.setPaintProperty(driverId, "circle-radius", 25);
  },
  workingDriver: function workingDriver(driverId) {
    city.map.setPaintProperty(driverId, "circle-color", '#f00');
  },
  deActivateDriver: function deActivateDriver(driverId) {
    city.map.setPaintProperty(driverId, "circle-radius", 15);
    city.map.setPaintProperty(driverId, "circle-color", '#fff');
  }
}

module.exports = draw;