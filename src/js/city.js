/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

var config = require("./config"),
  driver = require("./driver"),
  rider = require("./rider"),
  mapboxgl = require('mapbox-gl'),
  MapboxClient = require('mapbox'),
  turf = require('turf'),
  Chance = require('chance'),
  chance = new Chance(),
  geohash = require('ngeohash');

var city = {
  map: {},
  bounds: {},
  routes: [],
  drivers: [],
  riders: [],
  mapboxClient: {},
  spawnDrivers: function spawnDrivers(numberOfDrivers) {

    var i = 0,
      parent = this;

    for (i; i < numberOfDrivers; i++) {

      var point = {
        latitude: chance.latitude({
          min: this.bounds._sw.lat,
          max: this.bounds._ne.lat,
        }),
        longitude: chance.longitude({
          min: this.bounds._sw.lng,
          max: this.bounds._ne.lng,
        })

      };

      this.mapboxClient.getDirections([point, point],
        function (err, res) {

          parent.drivers.push(driver(
            [res.origin.geometry.coordinates[0], res.origin.geometry.coordinates[1]],
            chance.guid(),
            chance.name()));

        });

    }

  },
  spawnRiders: function spawnRiders(numberOfRiders) {

    var i = 0,
      parent = this;

    for (i; i < numberOfRiders; i++) {

      var point = {
        latitude: chance.latitude({
          min: this.bounds._sw.lat,
          max: this.bounds._ne.lat,
        }),
        longitude: chance.longitude({
          min: this.bounds._sw.lng,
          max: this.bounds._ne.lng,
        })

      };

      this.mapboxClient.getDirections([point, point],
        function (err, res) {

          parent.riders.push(rider(
            [res.origin.geometry.coordinates[0], res.origin.geometry.coordinates[1]],
            chance.guid(),
            chance.name()));

        });

    }

  },
  init: function init(city, cb) {

    var parent = this,
      ne = {},
      sw = {},
      zoomBounds = {};

    // Initialize the client with API key
    mapboxgl.accessToken = config.key;
    this.mapboxClient = new MapboxClient(config.key);

    // Create the map
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v8',
      center: city.center,
      zoom: city.zoom
    });

    // Get viewport boundaries
    this.bounds = this.map.getBounds();

    // Set limit to outward zoom
    sw = new mapboxgl.LngLat(this.bounds._sw.lng + 0.08, this.bounds._sw.lat + 0.08);
    ne = new mapboxgl.LngLat(this.bounds._ne.lng - 0.08, this.bounds._ne.lat - 0.08);
    zoomBounds = new mapboxgl.LngLatBounds(sw, ne);

    //    this.map.setMaxBounds(this.bounds);

    // Create drivers
    this.spawnDrivers(10);

    // Create riders
    this.spawnRiders(30);

    this.map.on('load', function () {
      cb();
    });

  },
  getClosestDriver: function getClosesDriver(rider) {

    var driverPointCollection = {
        "type": "FeatureCollection",
        "features": []
      },
      nearestDriver = {};

    // Make a collection of all drivers that are not currently occupied
    this.drivers.forEach(function (driver) {
      if (driver.occupied === false) {
        driverPointCollection.features.push(driver.point);
      }
    });

    if (driverPointCollection.features.length != 0) {

      nearestDriver = turf.nearest(rider.point, driverPointCollection);

      for (var i = 0, iLen = this.drivers.length; i < iLen; i++) {
        if (this.drivers[i].point.geometry.coordinates === nearestDriver.geometry.coordinates) {
          return i;
        }
      }
    } else {
      return('-1');
    }

  },
  directions: function directions(start, end, cb) {

    this.mapboxClient.getDirections([{
        latitude: start.point.geometry.coordinates[1],
        longitude: start.point.geometry.coordinates[0]
      }, {
        latitude: end.point.geometry.coordinates[1],
        longitude: end.point.geometry.coordinates[0]
      }],
      function (err, res) {

        cb({
          route: res.routes[0],
          routeId: chance.guid(),
          driver: start
        });

      });

  }
};

module.exports = city;