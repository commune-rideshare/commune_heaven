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
    inTransit: false,
    hail: function hail(destination) {
      
      this.waiting = true;
      
    },
    getOn: function getUp() {},
    getOff: function getOff() {}
  }

}

module.exports = rider;