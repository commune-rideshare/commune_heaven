/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

(function () {

  "use strict";

  // Require jQuery
  global.$ = require("jquery");

  var shared        = require("./shared"),
      Chance        = require('chance'),
      chance        = new Chance(),
      map           = require("./map");

  $(function () {

    var hongKong = {
      center: [114.1771, 22.2926],
      zoom: 14.11
    };

    map.init(hongKong.center, hongKong.zoom, function () {

      map.setBounds();
      
      setInterval(function () {
        
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

      }, 1000);

    });

  });

}());