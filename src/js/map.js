/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

var shared              = require("./shared"),
    mapboxgl            = require('mapbox-gl');

exports.init = function (center, zoom) {

  mapboxgl.accessToken = shared.key;

  shared.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v8',
      center: center,
      zoom: zoom
    });

}