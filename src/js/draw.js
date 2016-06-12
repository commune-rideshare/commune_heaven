/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

// Require jQuery
global.$ = require("jquery");

var config = require("./config"),
    mapboxgl = require('mapbox-gl'),
    moment = require('moment'),
    city = require("./city"),
    speed = 200;

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
        "circle-radius": config.normalSize,
        "circle-color": color,
        "circle-blur": 0.5
      }
    });

  },
  remove: function remove(id) {

    city.map.removeLayer(id);
    city.map.removeSource(id);

  },
  route: function route(data, cb) {

    var newPosition = {
        "type": "Point",
        "coordinates": []
      },
      i = 0,
      steps = data.route.geometry.coordinates.length,
      animation = {};

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
        "layout": {},
        "paint": {
          "line-color": config.workColor,
          "line-width": 2,
          //          "line-opacity": ,
          "line-dasharray": [2, 1]
        }
      });

      cb();

    }

  },
  activateDriver: function activateDriver(driverId) {
    city.map.setPaintProperty(driverId, "circle-radius", config.activeSize);
  },
  workingDriver: function workingDriver(driverId) {
    city.map.setPaintProperty(driverId, "circle-color", config.workColor);
  },
  deActivateDriver: function deActivateDriver(driverId) {
    city.map.setPaintProperty(driverId, "circle-radius", config.normalSize);
    city.map.setPaintProperty(driverId, "circle-color", config.activeColor);
  },
  waitingRider: function waitingRider(riderId) {
    city.map.setPaintProperty(riderId, "circle-color", config.waitColor);
  },
  resetRider: function resetRider(riderId) {
    city.map.setPaintProperty(riderId, "circle-color", config.riderColor);
  },
}

module.exports = draw;