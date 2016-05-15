/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

// Require jQuery
global.$ = require("jquery");

var shared = require("./shared"),
  ledger = require("./ledger"),
  // Libraries
  mapboxgl = require('mapbox-gl'),
  Chance = require('chance'),
  moment = require('moment'),
  chance = new Chance(),
  MapboxClient = require('mapbox'),
  geohash = require('ngeohash');

require("moment-duration-format");

function addPoint(id, coordinates, color) {

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
      "circle-blur": 0.5
    }
  });

}

function log(id, data) {

  var endpoints = data.summary.split(',');

  $('#log').prepend('<div id="' 
                    + id 
                    + '" class="panel"><div>' 
                    + moment().format('HH:mm:ss') 
                    + '</div><div class="origin">' 
                    + endpoints[0] 
                    + '</div><div class="destination">' 
                    + endpoints[1] 
                    + '</div><div class="distance">' 
                    + data.distance 
                    + ' meters</div><div class="duration">' 
                    + moment.duration(data.duration, 'seconds').format('mm:ss') 
                    + '</div><div class="shares">'
                    + data.distance 
                    + ' shares issued</div></div>');

}

function drawRoute(id, route, duration, distance, originId, destinationId) {

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
    //    speed = Math.floor(duration / steps),
    speed = 100,
    routeColor = "#FF5722",
    newShares = distance;
  
  console.log(newShares);

  map.map.addSource(id, source);
  
  map.routes.push(id);

  animation = setInterval(function () {
    data.geometry.coordinates = route.coordinates.slice(0, i);
    source.setData(data);
    i++;
    if (i > steps) {
      $('#' + id).addClass('complete');
      clearInterval(animation);
      map.map.setPaintProperty(originId, "circle-color", routeColor);
      map.map.setPaintProperty(originId, "circle-radius", 25);
      map.map.setPaintProperty(destinationId, "circle-color", routeColor);
      map.map.setPaintProperty(destinationId, "circle-radius", 25);
      ledger.totalShares += newShares;
      ledger.totalTrips++;
      setTimeout(function(){
        map.map.removeLayer(id);
        map.map.removeLayer(originId);
        map.map.removeLayer(destinationId);
      }, 1000);
    }
  }, speed);

  map.map.addLayer({
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
      zoom: city.zoom
    });

    this.map.on('load', function () {
      cb();
    });

  },
  directions: function directions(start, end) {

    this.mapboxClient.getDirections([start, end],
      function (err, res) {
      
      var origin            = [res.origin.geometry.coordinates[0], res.origin.geometry.coordinates[1]],
          destination       = [res.destination.geometry.coordinates[0], res.destination.geometry.coordinates[1]],
          distance          = res.routes[0].distance,
          duration          = res.routes[0].duration,         
          routeId           = chance.guid(),
          originId          = chance.guid(),
          destinationId     = chance.guid();
      
        console.log(res);

        addPoint(originId, origin, '#FFC107');
        addPoint(destinationId, destination, '#009688');
      
        drawRoute(routeId, res.routes[0].geometry, distance, duration, originId, destinationId);
      
        ledger.addEntry(routeId, 
              0, 
              geohash.encode(res.origin.geometry.coordinates[1], res.origin.geometry.coordinates[0]), 
              geohash.encode(res.destination.geometry.coordinates[1], res.destination.geometry.coordinates[0]), 
              distance, 
              duration);

        log(routeId, res.routes[0]);

      });

  },
  setBounds: function setBounds() {
    this.bounds = this.map.getBounds();
    this.map.setMaxBounds(this.bounds);
  }
}

module.exports = map;