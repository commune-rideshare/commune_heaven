/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

(function () {

  "use strict";

  // Require jQuery
  window.jQuery = global.$ = require('jquery');

  var config = require("./config"),
      ledger = require("./ledger"),
      city = require("./city"),
      draw = require("./draw"),
      cities = require("./cities"),
      Vue = require("vue"),
      Chance = require('chance'),
      chance = new Chance();

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

          console.log(city);

          var vueObject = this,
            counter = 0;

          $('#setup').addClass('hidden');

          city.init(cities[2], function () {

            city.drivers.forEach(function (driver) {
              console.log(driver);
//              draw.point(driver.id, driver.position, '#F00');
              draw.driver(driver);
            });

            city.riders.forEach(function (rider) {
              console.log(rider);
//            draw.point(rider.id, rider.position, '#00F');
              draw.rider(rider);
            });

            setInterval(function () {
              
              vueObject.numberOfShares = ledger.totalShares;
              vueObject.completedTrips = ledger.totalTrips;

            }, 500);

          });

        }
      }
    });

    $('#start').click();

  });

}());