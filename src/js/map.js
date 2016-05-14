/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

// Require jQuery
global.$ = require("jquery");

var shared        = require("./shared"),
    ledger        = require("./ledger"),
    // Libraries
    mapboxgl      = require('mapbox-gl'),
    Chance        = require('chance'),
    moment        = require('moment'),
    chance        = new Chance(),
    MapboxClient  = require('mapbox');

require("moment-duration-format");

function addPoint(coordinates, color) {

  var id = chance.guid();

  map.map.addSource(id, {
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

  map.map.addLayer({
    "id": id,
    "source": id,
    "type": "circle",
    "paint": {
      "circle-radius": 15,
      "circle-color": color,
      "circle-opacity": 0.7,
      "circle-blur": 0.5
    }
  });

}

function log(data) {

  var endpoints = data.summary.split(',');

  $('#log').prepend('<div class="panel"><div>' + moment().format('HH:mm:ss') + '</div><div class="origin">' + endpoints[0] + '</div><div class="destination">' + endpoints[1] + '</div><div class="distance">' + data.distance + ' meters</div><div class="duration">' + moment.duration(data.duration, 'seconds').format('mm:ss') + '</div></div>');

}

function drawRoute(route) {

  var id = chance.guid(),
    data = {
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
    animation = {};

  map.map.addSource(id, source);

  console.log(steps);

  map.routes.push(id);

  animation = setInterval(function () {
    data.geometry.coordinates = route.coordinates.slice(0, i);
    source.setData(data);
    i++;
    if (i > steps) {
      clearInterval(animation);
    }
  }, 100);
  
  map.map.addLayer({
    "id": id,
    "type": "line",
    "source": id,
    "layout": {
      "line-join": "round",
      "line-cap": "round"
    },
    "paint": {
      "line-color": "#FF5722",
      "line-width": 4,
      "line-opacity": 0.5
    }
  });

//  garbageCollector();

}

function garbageCollector() {

  console.log(map.routes.length);

  while (map.routes.length > 20) {
    map.map.removeLayer(map.routes.shift());
  }

}

var map = {
  map: {},
  bounds: {},
  routes: [],
  mapboxClient: {},
  init: function init(city, cb) {

    mapboxgl.accessToken = shared.key;

    this.mapboxClient = new MapboxClient(shared.key);

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v8',
      center: city.center,
      zoom: city.zoom,
      "transition": {
        "duration": 2000,
        "delay": 0
      }
    });

    this.map.on('load', function () {
      cb();
    });

  },
  directions: function directions(start, end) {

    this.mapboxClient.getDirections([start, end],
      function (err, res) {

        addPoint([res.origin.geometry.coordinates[0], res.origin.geometry.coordinates[1]], '#FFC107');
        addPoint([res.destination.geometry.coordinates[0], res.destination.geometry.coordinates[1]], '#009688');

        drawRoute(res.routes[0].geometry);

        log(res.routes[0]);

        console.log(res.routes[0]);


      });

  },
  setBounds: function setBounds() {
    this.bounds = this.map.getBounds();
    this.map.setMaxBounds(this.bounds);
  }
}

module.exports = map;