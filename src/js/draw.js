/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

// Require jQuery
global.$ = require("jquery");

var ledger        = require("./ledger"),
    mapboxgl      = require('mapbox-gl'),
    moment        = require('moment'),
    city          = require("./city");

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
  log: function log(id, data) {

    var endpoints = data.summary.split(',');

    $('#log').prepend('<div id="' + id + '" class="panel"><div>' + moment().format('HH:mm:ss') + '</div><div class="origin">' + endpoints[0] + '</div><div class="destination">' + endpoints[1] + '</div><div class="distance">' + data.distance + ' meters</div><div class="duration">' + moment.duration(data.duration, 'seconds').format('mm:ss') + '</div><div class="shares">' + data.distance + ' shares issued</div></div>');

  },
  driver: function driver(driver) {

    $('#drivers').append('<div id="' + driver.id + '" class="panel ' + driver.id + '">' + driver.name + '<span class="label label-default">0</span><span class="label label-success">0</span></div>');

  },
  rider: function rider(rider) {

    $('#riders').append('<div id="' + rider.id + '" class="panel ' + rider.id + '">' + rider.name + '<span class="label label-default">0</span><span class="label label-success">0</span></div>');

  },
  route: function route(id, route, duration, distance, originId, destinationId) {

    var data = {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "LineString",
          "coordinates": []
        }
      },
      source = new mapboxgl.GeoJSONSource({
        "data": data
      }),
      i = 0,
      steps = route.coordinates.length,
      animation = {},
      speed = 100,
      routeColor = "#FF5722",
      newShares = distance / 1000;

    city.map.addSource(id, source);

    city.routes.push(id);

    animation = setInterval(function () {
      data.geometry.coordinates = route.coordinates.slice(0, i);
      source.setData(data);
      i++;
      if (i > steps) {
        $('#' + id).addClass('complete');
        clearInterval(animation);
        city.map.setPaintProperty(originId, "circle-color", routeColor);
        city.map.setPaintProperty(originId, "circle-radius", 25);
        city.map.setPaintProperty(destinationId, "circle-color", routeColor);
        city.map.setPaintProperty(destinationId, "circle-radius", 25);
        ledger.totalShares += newShares;
        ledger.totalTrips++;
        setTimeout(function () {
          city.map.removeLayer(id);
          city.map.removeLayer(originId);
          city.map.removeLayer(destinationId);
        }, 1000);
      }
    }, speed);

    city.map.addLayer({
      "id": id,
      "type": "line",
      "source": id,
      "layout": {
        "line-join": "round",
        "line-cap": "round"
      },
      "paint": {
        "line-color": routeColor,
        "line-width": 4,
        "line-opacity": 0.5
      }
    });

  },
  activateDriver: function activateDriver(driverId) {
    console.log('nearest 2', driverId);
    city.map.setPaintProperty(driverId, "circle-color", "#fff");
  }
}

module.exports = draw;