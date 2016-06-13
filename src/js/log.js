/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

// Require jQuery
window.jQuery = global.$ = require('jquery');

//var notify = require('notifyjs-browser');

var log = {
  request: function request(rider) {
    // "Alice requested a ride"
    $('#log').prepend('<div class=request"><strong>' + rider.name + '</strong> requested a ride');
  },
  accept: function accept(driver) {
    // "Bob accepted the ride"
    $('#log').prepend('<div class="accept"><strong>' + driver.name + '</strong> accepted the ride');
  },
  pickUp: function pickUp(rider, driver, route) {
    // "Bob picked up Alice at X"
    $('#log').prepend('<div class="pick-up"><strong>' + driver.name + '</strong> picked up <strong>' + rider.name + '</strong> at <strong>' + route.summary.split(',')[0]) + '</strong>';
  },
  dropOff: function dropOff(rider, driver, route) {
    // "Bob dropped of Alice at X"
    $('#log').prepend('<div class="drop-off"><strong>' + driver.name + '</strong> dropped off <strong>' + rider.name + '</strong> at <strong>' + route.summary.split(',')[1]) + '</strong>';
  },
  noDrivers: function noDrivers() {
    // "No cars available!"
    $('#log').prepend('<div class="no-drivers"> No drivers available');
  }
}

module.exports = log;