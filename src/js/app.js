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
    Chance = require('chance'),
    log = require('./log'),
    howler = require('howler'),
    PoissonProcess = require('poisson-process'),
    chance = new Chance();

  $(function () {

    var counter = 0,
      ping = new Howl({
        urls: ['snd/ping.mp3']
      });

    $('#setup').addClass('hidden');

    $('#city').text(cities[3].text);

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

      // Poisson process to generate new rides
      var sim = PoissonProcess.create(1000, function message() {

        // Get a random rider and destination
        var destination = utilities.getRandomPoint(),
          riderIndex = 0,
          driverIndex = 0,
          guideRouteId = chance.guid(),
          newShares = 0;

        // Pull a random rider until one that is not in transit is found
        riderIndex = chance.integer({
          min: 0,
          max: (city.riders.length - 1)
        });

        if (city.riders[riderIndex].inTransit === true) {
          console.log('%c IN TRANSIT', 'background: #222; color: #bada55');
          return;
        }

        // Set riders state to "in transit" and "waiting"
        city.riders[riderIndex].waiting = true;
        city.riders[riderIndex].inTransit = true;

        //              console.log('rider pre-trip', city.riders[riderIndex]);
        //              console.log('driver pre-trip', city.drivers[driverIndex]);

        // Add rider to map
        draw.point(city.riders[riderIndex].id, city.riders[riderIndex].point.geometry.coordinates, config.riderColor);

        // Push ride-request notification
        log.request(city.riders[riderIndex]);

        // Find closest driver
        driverIndex = city.getClosestDriver(city.riders[riderIndex]);

        // Push ride-acceptance notification
        log.accept(city.drivers[driverIndex]);

        // Set drivers state to occupied
        city.drivers[driverIndex].occupied = true;

        //Activate closest driver
        draw.activateDriver(city.drivers[driverIndex].id);

        // Get directions between driver and rider
        city.directions(city.drivers[driverIndex], city.riders[riderIndex], function (route) {

          // Move driver to rider
          draw.route({
            'route': route.route,
            'routeId': route.routeId,
            'color': config.pickUpRouteColor,
            'animate': true,
            'driver': city.drivers[driverIndex]
          }, function () {

            // Push pick-up notification
            log.pickUp(city.riders[riderIndex], city.drivers[driverIndex], route.route);

            // Remove the rider-point from the map
            draw.remove(city.riders[riderIndex].id);

            // Indicate driver...
            draw.workingDriver(city.drivers[driverIndex].id);

            // Add Rider to passangerlist
            city.drivers[driverIndex].passengerList.push(city.riders[riderIndex].id);

            // Draw route to destination
            city.directions(city.riders[riderIndex], destination, function (route) {

              // Draw guide path
              draw.route({
                'route': route.route,
                'routeId': guideRouteId,
                'color': config.emptyRouteColor,
                'animate': false
              }, function () {

                // Move rider + driver to destination
                draw.route({
                  'route': route.route,
                  'routeId': route.routeId,
                  'color': config.emptyRouteColor,
                  'animate': true,
                  'driver': city.drivers[driverIndex]
                }, function () {

                  //
                  //
                  // RIDE COMPLETED
                  //
                  //

                  ping.play();

                  // Remove the guide-route from the map
                  draw.remove(guideRouteId);

                  // Calculate shares to issue based on on distance
                  newShares = Math.floor(route.route.distance);

                  // Update stats
                  ledger.totalShares += newShares;
                  ledger.totalTrips++;

                  // Update global stats view
                  $('#total-shares').text(ledger.totalShares);
                  $('#total-trips').text(ledger.totalTrips);

                  // Push drop-off notification
                  log.dropOff(city.riders[riderIndex], city.drivers[driverIndex], route.route);


                  //
                  // Update RIDER object and view
                  //

                  // Add shares to riders account
                  city.riders[riderIndex].shares += newShares;

                  // Add trip to riders account
                  city.riders[riderIndex].trips++;
                  // Set state of rider to "not in transit"
                  city.riders[riderIndex].inTransit = false;
                  // Set location of rider to drop-off-point
                  city.riders[riderIndex].point.geometry.coordinates = route.route.geometry.coordinates[route.route.geometry.coordinates.length - 1];
                  // Update view with rider shares
                  $('#' + city.riders[riderIndex].id)
                    .children('.shares')
                    .text(city.riders[riderIndex].shares);
                  // Update view with rider trips
                  $('#' + city.riders[riderIndex].id)
                    .children('.trips')
                    .text(city.riders[riderIndex].trips);


                  //
                  // Update DRIVER object and view
                  //

                  // Add trip to drivers account
                  city.drivers[driverIndex].trips++;
                  // Add shares to drivers account
                  city.drivers[driverIndex].shares += newShares;
                  // Set state of driver to "not occupied" 
                  city.drivers[driverIndex].occupied = false;
                  // Set location of driver to drop-off-point
                  city.drivers[driverIndex].point.geometry.coordinates = route.route.geometry.coordinates[route.route.geometry.coordinates.length - 1];
                  //DE-activate driver
                  draw.deActivateDriver(city.drivers[driverIndex].id);
                  // Update view with driver shares
                  $('#' + city.drivers[driverIndex].id)
                    .children('.shares')
                    .text(city.drivers[driverIndex].shares);
                  // Update view with driver trips
                  $('#' + city.drivers[driverIndex].id)
                    .children('.trips')
                    .text(city.drivers[driverIndex].trips);


                });

              });

            });

          });

        });

      });

      sim.start();

    });

  });

}());