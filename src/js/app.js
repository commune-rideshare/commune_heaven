/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

(function () {

  "use strict";

  // Require jQuery
  window.jQuery = global.$ = require('jquery');

  var config = require("./config")
  var city = require("./city")
  var utilities = require("./utilities")
  var draw = require("./draw")
  var cities = require("./cities")
  var Chance = require('chance')
  var chance = new Chance()
  var log = require('./log')
  var PoissonProcess = require('poisson-process')
  var Vue = require('vue')
  var Chart = require('chart.js')
  var howler = require('howler')
  var ping = new Howl({urls: ['snd/ping.mp3']})
  var counter = 0
  var simulationSpeed = 3000

  require('jquery.marquee');

  $(function () {

    $('.marquee')
      .marquee({
        duplicated: true,
        pauseOnHover: true,
        duration: 60000,
        startVisible: true,
        direction: 'left',
        gap: 50
      })

    // var driverBox = new Vue({
    //   el: '#drivers',
    //   data: {
    //     driver: {name: '', rides: 0, shares: 0, percentage: 0, guid: ''},
    //     drivers: []
    //   },
    //   methods: {
    //     counter: function () {
    //       return this.drivers.length
    //    }
    //  }
    // })
    // var passengerBox = new Vue({
    //   el: '#passengers',
    //   data: {
    //     passenger: {name: '', rides: 0, shares: 0, percentage: 0, guid: ''},
    //     passengers: []
    //   }, methods: {
    //     counter: function () {
    //       return this.passengers.length
    //    }
    //  }
    // })
    // var ridesBox = new Vue({
    //   el: '#rides',
    //   data: {
    //     ride: {guid: '', distance: 0, shares: 0},
    //     rides: []
    //   }, methods: {
    //     counter: function () {
    //       return this.rides.length
    //    }
    //  }
    // })
    var stats = new Vue({
      el: '#stats',
      data: {
        driverShares: 0,
        riderShares: 0,
        investorShares: 0,
        driverPercentage: 0,
        riderPercentage: 0,
        investorPercentage: 0
      }
    })
    var ctx = $("#ownershipChart")
    var ownershipChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ["Drivers", "Passengers", "Investors"],
        datasets: [{
            data: [1, 1, 1,],
            backgroundColor: [
                '#FDAFD1',
                '#FEDC58',
                '#e8e8e8'
            ],
            borderWidth: 0
        }]
      },
      options: {
        legend: {
          display: false,
        }
      }})

    // Initialize the map...
    city.init(cities[3], function () {

      // Initialize drivers
      city.drivers.forEach(function (driver) {
        // Draw driver on map
        draw.point(driver.id, driver.point.geometry.coordinates, config.driverColor);
      });


      // Initialize riders
      city.riders.forEach(function (rider) {
        // Add rider to table
        draw.point(rider.id, rider.point.geometry.coordinates, config.riderColor)
        draw.deActivateRider(rider.id)
      });

      // Poisson process to generate new rides
      var sim = PoissonProcess.create(simulationSpeed, function message() {

        city.drivers.forEach(function(driver){
          if(driver.occupied) {
            console.log('occupied', driver.name)
          }
        })

        console.dir(city.drivers)

        // Get a random rider and destination
        var destination = utilities.getRandomPoint()
        var riderIndex = 0
        var driverIndex = 0
        var guideRouteId = chance.guid()
        var newShares = 0
        var rideIndex = chance.guid()

        // Assign driver from waiting list
        if (city.waitingList.length > 0) {

          console.log('pulled from waiting list');

          riderIndex = city.waitingList.shift();

        } else {

          while(true) {

            // Pull a random rider
            riderIndex = chance.integer({
              min: 0,
              max: (city.riders.length - 1)
            })

            // If the rider is already in transit, break
            if (city.riders[riderIndex].inTransit) {
              continue
            } else {
              break
            }
          }
        }

        log.request(city.riders[riderIndex].id)

        // Push ride-request notification
        draw.activateRider(city.riders[riderIndex].id)

        // Push ride-request notification
        log.request(city.riders[riderIndex])

        // Set riders state to "in transit" and "waiting"
        city.riders[riderIndex].inTransit = true

        // Find closest driver
        driverIndex = city.getClosestDriver(city.riders[riderIndex])

        /// If there are no cars available, add the request to the waiting list
        if (driverIndex < 0) {
          console.log('added to waiting list')
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
        // draw.activateDriver(city.drivers[driverIndex].id);

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
            draw.deActivateRider(city.riders[riderIndex].id)

            // Indicate driver...
            draw.activateDriver(city.drivers[driverIndex].id);

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
                  'driver': city.drivers[driverIndex],
                  'rider': city.riders[riderIndex]
                }, function () {


                  console.log('RIDE COMPLETED')

                  //
                  //
                  // RIDE COMPLETED
                  //
                  //

                  ping.play();

                  draw.deActivateDriver(city.drivers[driverIndex].id);

                  // Remove the guide-route from the map
                  draw.remove(guideRouteId);

                  // Calculate shares to issue based on on distance
                  newShares = Math.floor(route.route.distance);

                  var extraShares = 0

                  // fake rideshare
                  if(chance.weighted([true, false], [1, 3])) {

                    // Pull a random rider
                    var extraRider = chance.integer({
                      min: 0,
                      max: (city.riders.length - 1)
                    })

                    // If the rider is already in transit, break
                    if (city.riders[extraRider].inTransit) {
                      return
                    }

                    extraShares = Math.floor(Math.random() * newShares)

                    // Add shares to riders account
                    city.riders[extraRider].shares += extraShares
                    // Add trip to riders account
                    city.riders[extraRider].trips++

                  }

                  // Update stats
                  city.riderShares += newShares + extraShares
                  city.driverShares += newShares
                  city.investorShares += Math.floor(newShares * city.investorDecay)

                  city.totalShares += 3 * newShares
                  city.totalTrips++

                  city.riderPercentage = Math.floor((city.riderShares / city.totalShares) * 100)
                  city.driverPercentage = Math.floor((city.driverShares / city.totalShares) * 100)
                  city.investorPercentage = Math.floor((city.investorShares / city.totalShares) * 100)

                  // Push drop-off notification
                  log.dropOff(city.riders[riderIndex], city.drivers[driverIndex], route.route);

                  //
                  // Add ride to databse
                  //

                  var newRide = {
                    id: rideIndex,
                    distance: route.route.distance,
                    shares: (newShares * 2)
                  }
                  city.rides.push(newRide);


                  //
                  // Update RIDER object and view
                  //

                  // Add shares to riders account
                  city.riders[riderIndex].shares += newShares
                  // Add trip to riders account
                  city.riders[riderIndex].trips++
                  // Set state of rider to "not in transit"
                  city.riders[riderIndex].inTransit = false
                  // Set location of rider to drop-off-point
                  city.riders[riderIndex].point.geometry.coordinates = route.route.geometry.coordinates[route.route.geometry.coordinates.length - 1]
                  // Hide rider
                  draw.deActivateRider(city.riders[riderIndex].id)

                  //
                  // Update DRIVER object and view
                  //

                  // Add trip to drivers account
                  city.drivers[driverIndex].trips++
                  // Add shares to drivers account
                  city.drivers[driverIndex].shares += newShares
                  // Set state of driver to "not occupied"
                  city.drivers[driverIndex].occupied = false
                  // Set location of driver to drop-off-point
                  city.drivers[driverIndex].point.geometry.coordinates = route.route.geometry.coordinates[route.route.geometry.coordinates.length - 1]
                  //DE-activate driver
                  // draw.deActivateDriver(city.drivers[driverIndex].id);

                  // console.log('drivershares', city.driverShares);
                  // console.log('ridershares', city.riderShares);
                  // console.log('investorShares', city.investorShares);
                  // console.log('totalshares', city.totalShares);

                  // Update stats
                  stats.driverShares = city.driverShares
                  stats.driverPercentage = city.driverPercentage

                  stats.riderShares = city.riderShares
                  stats.riderPercentage = city.riderPercentage

                  stats.investorShares = city.investorShares
                  stats.investorPercentage = city.investorPercentage

                  // Update chart
                  ownershipChart.data.datasets[0].data[0] = city.driverShares
                  ownershipChart.data.datasets[0].data[1] = city.riderShares
                  ownershipChart.data.datasets[0].data[2] = city.investorShares
                  ownershipChart.update()

                  //investorDecay
                  city.investorDecay -= 0.001

                });

              });

            });

          });

        });

      });

      // Start simulation
      sim.start();

    });

  });

}());
