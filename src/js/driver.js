/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

"use strict";

var config = require("./config");

function driver(startPosition, id, name) {

  return {
    point: {
      "type": "Feature",
      "properties": {
        "marker-color": config.driverColor
      },
      "geometry": {
        "type": "Point",
        "coordinates": startPosition
      }
    },
    id: id,
    name: name,
    shares: 0,
    trips: 0,
    occupied: false,
    passengerList: []
  }

}

module.exports = driver;