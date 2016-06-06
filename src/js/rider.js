/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

"use strict";

var config = require("./config");

function rider(startPosition, id, name) {

  return {
    point: {
      "type": "Feature",
      "properties": {
        "marker-color": config.riderColor
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
    waiting: false,
    inTransit: false
  }

}

module.exports = rider;