/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

"use strict";

function driver(startPosition, id, name) {

  return {
    position: startPosition,
    id: id,
    name: name,
    shares: 0,
    trips: 0,
    drive: function drive(destination) {},
    pickUp: function pickUp() {},
    dropOff: function dropOff() {}
  }

}

module.exports = driver;