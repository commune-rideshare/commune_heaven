/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

(function () {

  "use strict";

  // Require jQuery
  window.jQuery = global.$ = require('jquery');

  var config = require("./config"),
    city = require("./city"),
    utilities = require("./utilities"),
    draw = require("./draw"),
    cities = require("./cities"),
    Chance = require('chance'),
    chance = new Chance(),
    log = require('./log'),
    PoissonProcess = require('poisson-process'),
    howler = require('howler'),
    ping = new Howl({
      urls: ['snd/ping.mp3']
    }),
    counter = 0,
    simulationSpeed = 4000;

  // Find the right method, call on correct element
  function launchIntoFullscreen(element) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }

  function calculateOwnershipPercentage() {

    var driverShares = 0,
      riderShares = 0;

    // Update and refresh ownership percentage for DRIVERS
    for (var i = 0; i < city.drivers.length; i++) {
      city.drivers[i].percentage = (city.drivers[i].shares / city.totalShares) * 100;

      $('#' + city.drivers[i].id)
        .children('.percentage')
        .text(Math.floor(city.drivers[i].percentage));

      driverShares += city.drivers[i].shares;

    }

    // Update and refresh ownership percentage for RIDERS
    for (var i = 0; i < city.riders.length; i++) {
      city.riders[i].percentage = (city.riders[i].shares / city.totalShares) * 100;

      $('#' + city.riders[i].id)
        .children('.percentage')
        .text(Math.floor(city.riders[i].percentage));

      riderShares += city.riders[i].shares;

    }

    console.log('drivershares', driverShares);
    console.log('ridershares', riderShares);
    console.log('totalshares', city.totalShares);

    var driverOwnership = Math.floor((driverShares / city.totalShares) * 100),
      riderOwnership = Math.floor((riderShares / city.totalShares) * 100);

    $('#rider-ownership')
      .text(riderOwnership + '%');

    $('#driver-ownership')
      .text(driverOwnership + '%');

    $('#own-inner').css('width', driverOwnership + '%');
  }

  $(function () {

    $('#start').click(function () {

      // Launch fullscreen
      launchIntoFullscreen(document.documentElement);

      // Hide the start button
      $('#start').hide();

      // Show the app
      $('#app').show();

      // Set the name of the city in the menu bar
      $('#city').text(cities[3].text);

      // Initialize the map...
      city.init(cities[3], function () {

        // Initialize drivers
        city.drivers.forEach(function (driver) {
          // Draw driver on map
          draw.point(driver.id, driver.point.geometry.coordinates, config.driverColor);
          // Add driver to table 
          $('#drivers-table').append('<tr id="' + driver.id + '" class="' + driver.id + '"><td>' + driver.name + '</td><td class="trips">0</td><td class="shares">0</td><td class="percentage">0</td><tr>');
        });

        // Initialize riders
        city.riders.forEach(function (rider) {
          // Add rider to table 
          $('#riders-table').append('<tr id="' + rider.id + '" class="' + rider.id + '"><td>' + rider.name + '</td><td class="trips">0</td><td class="shares">0</td><td class="percentage">0</td><tr>');
        });

        // Poisson process to generate new rides
        var sim = PoissonProcess.create(simulationSpeed, function message() {

          // Get a random rider and destination
          var destination = utilities.getRandomPoint(),
            riderIndex = 0,
            driverIndex = 0,
            guideRouteId = chance.guid(),
            newShares = 0,
            rideIndex = chance.guid();

          // Assign driver from waiting list
          if (city.waitingList.length > 0) {

            console.log('pulled from waiting list');

            riderIndex = city.waitingList.shift();

            draw.resetRider(city.riders[riderIndex].id);

          } else {

            // Pull a random rider
            riderIndex = chance.integer({
              min: 0,
              max: (city.riders.length - 1)
            });

            // If the rider is already in transit, break
            if (city.riders[riderIndex].inTransit) {
              return;
            }

            // Add rider to map
            draw.point(city.riders[riderIndex].id, city.riders[riderIndex].point.geometry.coordinates, config.riderColor);

          }

          // Push ride-request notification
          log.request(city.riders[riderIndex]);

          // Set riders state to "in transit" and "waiting"
          city.riders[riderIndex].inTransit = true;

          // Find closest driver
          driverIndex = city.getClosestDriver(city.riders[riderIndex]);

          /// If there are no cars available, add the request to the waiting list
          if (driverIndex < 0) {
            log.noDrivers();
            city.waitingList.push(riderIndex);
            draw.waitingRider(city.riders[riderIndex].id);
            return;
          }

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
                    city.totalShares += 2 * newShares;
                    city.totalTrips++;

                    // Update global stats view
                    $('#total-shares').text(city.totalShares);
                    $('#total-trips').text(city.totalTrips);

                    // Push drop-off notification
                    log.dropOff(city.riders[riderIndex], city.drivers[driverIndex], route.route);

                    //
                    // Update ride-table
                    //

                    var newRide = {
                      id: rideIndex,
                      distance: route.route.distance,
                      shares: (newShares * 2)
                    };
                    city.rides.push(newRide);
                    $('.ride-table-body').prepend('<tr id="' + newRide.id + '" class="' + newRide.id + '"><td>' + newRide.id + '</td><td class="distance">' + newRide.distance + '</td><td class="shares">' + newRide.shares + '</td>><tr>');


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
                    // Update view with driver ownership percentage
                    // Update view with driver trips
                    $('#' + city.drivers[driverIndex].id)
                      .children('.trips')
                      .text(city.drivers[driverIndex].trips);

                    //Update ownership percentage
                    calculateOwnershipPercentage();

                  });

                });

              });

            });

          });

        });

        sim.start();

      });

    });

  });

}());