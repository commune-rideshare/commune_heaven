window.jQuery = global.$ = require('jquery')

var log = {
  request: function request (rider) {
    // "Alice requested a ride"
    $('#log').html('<div class=request"><strong>' + rider.name + '</strong> requested a ride')
  },
  accept: function accept (driver) {
    // "Bob accepted the ride"
    $('#log').html('<div class="accept"><strong>' + driver.name + '</strong> accepted the ride')
  },
  pickUp: function pickUp (rider, driver, route) {
    // "Bob picked up Alice at X"
    $('#log').html('<div class="pick-up"><strong>' + driver.name + '</strong> picked up <strong>' + rider.name + '</strong> at <strong>' + route.summary.split(',')[0]) + '</strong>'
  },
  dropOff: function dropOff (rider, driver, route) {
    // "Bob dropped of Alice at X"
    $('#log').html('<div class="drop-off"><strong>' + driver.name + '</strong> dropped off <strong>' + rider.name + '</strong> at <strong>' + route.summary.split(',')[1]) + '</strong>'
  },
  noDrivers: function noDrivers () {
    // "No cars available!"
    $('#log').html('<div class="no-drivers"> No drivers available')
  }
}

module.exports = log
