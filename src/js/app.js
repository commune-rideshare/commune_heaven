/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

(function () {

  "use strict";

  // Require jQuery
  global.$ = require("jquery");

  var shared = require("./shared"),
    ledger = require("./ledger"),
    map = require("./map"),
    cities = require("./cities"),
    Vue = require("vue"),
    Chance = require('chance'),
    moment = require('moment'),
    chance = new Chance();

  function triggerRide() {

    map.directions({
      latitude: chance.latitude({
        min: map.bounds._sw.lat,
        max: map.bounds._ne.lat,
      }),
      longitude: chance.longitude({
        min: map.bounds._sw.lng,
        max: map.bounds._ne.lng,
      })
    }, {
      latitude: chance.latitude({
        min: map.bounds._sw.lat,
        max: map.bounds._ne.lat,
      }),
      longitude: chance.longitude({
        min: map.bounds._sw.lng,
        max: map.bounds._ne.lng,
      })

    });

  }

  $(function () {

    new Vue({
      el: '#app',
      data: {
        time: 0,
        numberOfShares: 0,
        completedTrips: 0
      },
      methods: {
        startSimulation: function () {

          var vueObject = this,
            counter = 0;

          $('#setup').addClass('hidden');

          map.init(cities.maputo, function () {

            map.setBounds();

            triggerRide();

            setInterval(function () {

              triggerRide();

            }, 3000);

            setInterval(function () {
              
              console.log(ledger.totalShares);

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