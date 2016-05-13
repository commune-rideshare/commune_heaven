/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

var shared          = require("./shared"),
    mapboxgl        = require('mapbox-gl'),
    Chance          = require('chance'),
    chance          = new Chance(),
    MapboxClient    = require('mapbox');

function addPoint(coordinates, color) {

  console.log(coordinates);

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
      "circle-radius": 5,
      "circle-color": color,
      "circle-opacity": 0.7
    }
  });

}

function drawRoute(route) {

  var id = chance.guid();
  
  map.routes.push(id);

  map.map.addSource(id, {
    "type": "geojson",
    "data": {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": route.coordinates
      }
    }
  });

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
  
  console.log(map.routes);
  
  garbageCollector();

}

function garbageCollector() {
  
  console.log(map.routes.length);
  
  while(map.routes.length > 20) {
    map.map.removeLayer(map.routes.shift());
  }
  
}

var map = {
  map: {},
  bounds: {},
  routes: [],
  mapboxClient: {},
  init: function init(center, zoom, cb) {

    mapboxgl.accessToken = shared.key;

    this.mapboxClient = new MapboxClient(shared.key);

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v8',
      center: center,
      zoom: zoom,
      "transition": {
        "duration": 2000,
        "delay": 0
      }
    });

    console.log(this.map.getBounds());

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

        console.log(res);

      });
  },
  setBounds() {
    this.bounds = this.map.getBounds();
    this.map.setMaxBounds(this.bounds);
  }
}

module.exports = map;