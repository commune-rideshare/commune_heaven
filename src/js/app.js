/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

(function () {

  "use strict";

  // Require jQuery
  window.jQuery = global.$ = require('jquery');

  var config        = require("./config"),
      ledger        = require("./ledger"),
      city          = require("./city"),
      draw          = require("./draw"),
      cities        = require("./cities"),
      Vue           = require("vue"),
      Chance        = require('chance'),
      chance        = new Chance();

  function getRandomPoint() {

    var point = [chance.longitude({
      min: city.bounds._sw.lng,
      max: city.bounds._ne.lng,
    }), chance.latitude({
      min: city.bounds._sw.lat,
      max: city.bounds._ne.lat,
    })];

    return point;

  }

  function triggerRide() {

    city.directions({
      latitude: chance.latitude({
        min: city.bounds._sw.lat,
        max: city.bounds._ne.lat,
      }),
      longitude: chance.longitude({
        min: city.bounds._sw.lng,
        max: city.bounds._ne.lng,
      })
    }, {
      latitude: chance.latitude({
        min: city.bounds._sw.lat,
        max: city.bounds._ne.lat,
      }),
      longitude: chance.longitude({
        min: city.bounds._sw.lng,
        max: city.bounds._ne.lng,
      })

    });

  }

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
            counter = 0;

          $('#setup').addClass('hidden');

          city.init(cities[3], function () {

            city.drivers.forEach(function (driver) {

              draw.point(driver.id, driver.point.geometry.coordinates, '#F00');
              draw.driver(driver);
            });

            city.riders.forEach(function (rider) {
              draw.rider(rider);
            });

            //            setInterval(function () {
            //
            //              vueObject.numberOfShares = ledger.totalShares;
            //              vueObject.completedTrips = ledger.totalTrips;
            //
            //            }, 500);

            setInterval(function () {

              var destination     = getRandomPoint(),
                  rider           = chance.pickone(city.riders);
              
              // Hail driver
              rider.hail(destination);
              // Activate rider
              draw.point(rider.id, rider.point.geometry.coordinates, config.riderColor);
              // Draw destination
              draw.point(chance.guid(), destination, '#0F0');

              //Get closest driver and activate
              draw.activateDriver(city.getClosestDriver(rider));

            }, 5000);

          });

        }
      }
    });

    $('#start').click();

  });

}());