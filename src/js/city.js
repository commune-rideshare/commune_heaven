/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

var config = require("./config"),
  ledger = require("./ledger"),
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

    var parent = this;

    mapboxgl.accessToken = config.key;

    this.mapboxClient = new MapboxClient(config.key);

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v8',
      center: city.center,
      zoom: city.zoom
    });

    this.bounds = this.map.getBounds();
    this.map.setMaxBounds(this.bounds);

    this.spawnDrivers(10);
    this.spawnRiders(20);

    this.map.on('load', function () {
      cb();
    });

  },
  getClosestDriver: function getClosesDriver(rider) {

      var driverPointCollection = {
        "type": "FeatureCollection",
        "features": []
      };

      this.drivers.forEach(function (driver) {
        if (driver.occupied === false) {
          driverPointCollection.features.push(driver.point);
        }
      });

      console.log(driverPointCollection);

      if (driverPointCollection.features.length != 0) {

        var nearestDriver = turf.nearest(rider.point, driverPointCollection);

        for (var i = 0, iLen = this.drivers.length; i < iLen; i++) {
          if (this.drivers[i].point.geometry.coordinates == nearestDriver.geometry.coordinates) {
            this.drivers[i].occupied = true;
            return this.drivers[i].id;
          }
        }

      } else {
        console.log('all cars occupied');
      }

    }
    //  directions: function directions(start, end) {
    //
    //    this.mapboxClient.getDirections([start, end],
    //      function (err, res) {
    //
    //        var origin = [res.origin.geometry.coordinates[0], res.origin.geometry.coordinates[1]],
    //          destination = [res.destination.geometry.coordinates[0], res.destination.geometry.coordinates[1]],
    //          duration = res.routes[0].duration,
    //          distance = res.routes[0].distance,
    //          routeId = chance.guid(),
    //          originId = chance.guid(),
    //          destinationId = chance.guid();
    //
    //        draw.point(originId, origin, '#FFC107');
    //        draw.point(destinationId, destination, '#009688');
    //
    //        draw.route(routeId, res.routes[0].geometry, duration, distance, originId, destinationId);
    //
    //        ledger.addEntry(routeId,
    //          0,
    //          geohash.encode(res.origin.geometry.coordinates[1], res.origin.geometry.coordinates[0]),
    //          geohash.encode(res.destination.geometry.coordinates[1], res.destination.geometry.coordinates[0]),
    //          distance,
    //          duration);
    //
    //        draw.log(routeId, res.routes[0]);
    //
    //      });
    //
    //  }
};

module.exports = city;