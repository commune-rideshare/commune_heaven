/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

var ledger = {
  data: [],
  totalShares: 0,
  totalTrips: 0,
  addEntry: function addEntry(routeHash, userId, originHash, destinationHash, distance, duration) {

    this.data.push({
      'routeHash': routeHash,
      'userId': userId,
      'originHash': originHash,
      'destinationHash': destinationHash,
      'distance': distance,
      'duration': duration
    });

  }
}

module.exports = ledger;