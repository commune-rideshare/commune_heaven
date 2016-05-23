/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

"use strict";


function rider(startPosition, id, name) {

  return {
    position: startPosition,
    id: id,
    name: name,
    shares: 0,
    trips: 0,
    requestRide: function requestRide(destination) {},
    getOn: function getUp() {},
    getOff: function getOff() {}
  }
  
}

module.exports = rider;