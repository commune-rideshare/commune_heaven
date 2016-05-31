/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

(function () {

  "use strict";

  // Require jQuery
  window.jQuery = global.$ = require('jquery');

  var config = require("./config"),
    ledger = require("./ledger"),
    city = require("./city"),
    utilities = require("./utilities"),
    draw = require("./draw"),
    cities = require("./cities"),
    Vue = require("vue"),
    Chance = require('chance'),
    chance = new Chance();


  $(function () {

    new Vue({
      el: '#app',
      data: {
        time: 0,
        numberOfShares: 0,
        completedTrips: 0,
        citiesOptions: cities,
        city: ''
      },
      methods: {
        startSimulation: function () {

          var vueObject = this,
            counter = 0,
            closestDriver = {};

          $('#setup').addClass('hidden');

          vueObject.city = cities[3].text;

          city.init(cities[3], function () {

            // Show drivers
            city.drivers.forEach(function (driver) {
              // Draw driver on map
              draw.point(driver.id, driver.point.geometry.coordinates, config.driverColor);
              // Add driver to table 
              draw.driver(driver);

            });

            // Show riders
            city.riders.forEach(function (rider) {
              // Add rider to table 
              draw.rider(rider);
            });

            // Update stats every 1s
            setInterval(function () {
              vueObject.numberOfShares = ledger.totalShares;
              vueObject.completedTrips = ledger.totalTrips;
            }, 1000);

            // Generate new ride
            setInterval(function () {

              var destination = utilities.getRandomPoint(),
                rider = chance.pickone(city.riders);

              // Hail driver
              rider.hail(destination);
              // Activate rider
              draw.point(rider.id, rider.point.geometry.coordinates, config.riderColor);

              // Find closest driver
              closestDriver = city.getClosestDriver(rider);

              //Activate closest driver
              draw.activateDriver(closestDriver.id);

              // Get directions between driver and rider
              city.directions(closestDriver, rider, function (route) {
                
                // Draw driver trip to rider
                draw.route({
                  'route': route.route,
                  'routeId': route.routeId,
                  'color': config.pickUpRouteColor,
                  'animate': true,
                  'driver': route.driver
                }, function () {
                  console.log('Driver arrived');

                  // Draw route to destination
                  city.directions(rider, destination, function (route) {

                    console.log(route.routeId);

                    draw.route({
                      'route': route.route,
                      'routeId': route.routeId,
                      'color': config.emptyRouteColor,
                      'animate': false
                    }, function () {
                      console.log('dropoff path drawn');
                    });

                  });

                });

              });

            }, 5000);

          });

        }
      }
    });

    $('#start').click();

  });

}());