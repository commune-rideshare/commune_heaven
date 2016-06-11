/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

// Require jQuery
window.jQuery = global.$ = require('jquery');

//var notify = require('notifyjs-browser');

var log = {
  request: function request(rider) {
    // "Alice requested a ride"
    $('#log').prepend('<div class=request"><strong>' + rider.name + '</strong> requested a ride');

    //    console.log('%c⚑ ' + rider.name + '%c' + ' requested a ride', 'background: #0f0', 'background: #fff');

  },
  accept: function accept(driver) {
    // "Bob accepted the ride"
    $('#log').prepend('<div class="accept"><strong>' + driver.name + '</strong> accepted the ride');

    //    console.log('%c☯ ' + driver.name + '%c' + ' accepted the ride', 'background: #99f', 'background: #fff');
  },
  pickUp: function pickUp(rider, driver, route) {
    // "Bob picked up Alice at X"
    $('#log').prepend('<div class="pick-up"><strong>' + driver.name + '</strong> picked up <strong>' + rider.name + '</strong> at <strong>' + route.summary.split(',')[0]) + '</strong>';

    //          console.log('%c⬆ ' + driver.name + '%c picked up %c' + rider.name + '%c at ' + route.summary.split(',')[0], 'background: #99f', 'background: #fff', 'background: #0f0', 'background: #fff');
  },
  dropOff: function dropOff(rider, driver, route) {
    // "Bob dropped of Alice at X"
    $('#log').prepend('<div class="drop-off"><strong>' + driver.name + '</strong> dropped off ' + rider.name + '</strong> at <strong>' + route.summary.split(',')[1]) + '</strong>';

    //          console.log('%c✔ ' + driver.name + '%c dropped off %c' + rider.name + '%c at' + route.summary.split(',')[1], 'background: #99f', 'background: #fff', 'background: #0f0', 'background: #fff');
  },
  noDrivers: function noDrivers() {
    // "No cars available!"
    $('#log').prepend('<div class="no-drivers"> No drivers available');

    //          console.log('%c✖ No cars available', 'background: #f00');
  }
}

module.exports = log;