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
  log: function log(id, data) {
    
    var endpoints = data.summary.split(',');
    
    $('#log').prepend('<div id="' + id + '" class="panel"><div>' + moment().format('HH:mm:ss') + '</div><div class="origin">' + endpoints[0] + '</div><div class="destination">' + endpoints[1] + '</div><div class="distance">' + data.distance + ' meters</div><div class="duration">' + moment.duration(data.duration, 'seconds').format('mm:ss') + '</div><div class="shares">' + data.distance + ' shares issued</div></div>');

  },
  driver: function driver(driver) {

    $('#drivers-table').append('<tr id="' + driver.id + '" class="' + driver.id + '"><td>' + driver.name + '</td><td>' + driver.shares + '</td><tr>');

  },
  rider: function rider(rider) {

    $('#riders-table').append('<tr id="' + rider.id + '" class="' + rider.id + '"><td>' + rider.name + '</td><td>' + rider.shares + '</td><tr>');

  },
  route: function route(route, id, routeColor, animate) {

    console.log(route)

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
      steps = route.geometry.coordinates.length,
      animation = {},
      speed = 100,
      newShares = route.distance / 1000;

    city.map.addSource(id, source);

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

    city.routes.push(id);

    if (animate == true) {

      animation = setInterval(function () {
        data.geometry.coordinates = route.geometry.coordinates.slice(0, i);
        source.setData(data);
        i++;
        if (i > steps) {
          //        $('#' + id).addClass('complete');
          clearInterval(animation);
          //        city.map.setPaintProperty(originId, "circle-color", routeColor);
          //        city.map.setPaintProperty(originId, "circle-radius", 25);
          //        city.map.setPaintProperty(destinationId, "circle-color", routeColor);
          //        city.map.setPaintProperty(destinationId, "circle-radius", 25);
          ledger.totalShares += newShares;
          ledger.totalTrips++;
          setTimeout(function () {
            //          city.map.removeLayer(id);
            //          city.map.removeLayer(originId);
            //          city.map.removeLayer(destinationId);
          }, 1000);
        }
      }, speed);

    } else {
      data.geometry.coordinates = route.geometry.coordinates;
      source.setData(data);
    }

  },
  activateDriver: function activateDriver(driverId) {
    console.log('nearest 2', driverId);
    city.map.setPaintProperty(driverId, "circle-color", "#fff");
  }
}

module.exports = draw;