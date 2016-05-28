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
        citiesOptions: cities
      },
      methods: {
        startSimulation: function () {

          var vueObject = this,
            counter = 0,
            closestDriver = {};

          $('#setup').addClass('hidden');

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

            // Update stats every 0.5s
            setInterval(function () {
              vueObject.numberOfShares = ledger.totalShares;
              vueObject.completedTrips = ledger.totalTrips;
            }, 500);

            // Generate new ride
            setInterval(function () {

              var destination = utilities.getRandomPoint(),
                rider = chance.pickone(city.riders);

              // Hail driver
              rider.hail(destination);
              // Activate rider
              draw.point(rider.id, rider.point.geometry.coordinates, config.riderColor);
              // Draw route to destination
              city.directions(rider.point.geometry.coordinates, destination, function (route) {
                console.log('rider route', route);
                draw.route(route.route, route.routeId, config.emptyRouteColor, false);
              });

              // Find closest driver
              closestDriver = city.getClosestDriver(rider);

              //Activate closest driver
              draw.activateDriver(closestDriver.id);

              // Get directions betwwen driver and rider
              city.directions(closestDriver.point.geometry.coordinates, rider.point.geometry.coordinates, function (route) {
                console.log('driver route', route);
                draw.route(route.route, route.routeId, config.pickUpRouteColor, true);
              });

              //              ledger.addEntry(routeId,
              //                0,
              //                geohash.encode(res.origin.geometry.coordinates[1], res.origin.geometry.coordinates[0]),
              //                geohash.encode(res.destination.geometry.coordinates[1], res.destination.geometry.coordinates[0]),
              //                distance,
              //                duration);
              //
              //              draw.log(routeId, res.routes[0]);


            }, 5000);

          });

        }
      }
    });

    $('#start').click();

    $(document).on('click', '.info-box', function () {
      $(this).children('table').slideToggle();
      //      $(this).toggleClass('active');
    });

  });

}());