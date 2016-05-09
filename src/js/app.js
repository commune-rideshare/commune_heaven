/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true*/
/*global $, jQuery*/

(function () {

  "use strict";
  
  // Require jQuery
  global.$                = require("jquery");
    
  var shared              = require("./shared"),
      map                 = require("./map");
  
  $(function () {
    
    var stockholm     = [18.0644, 59.319],
        hongKong      = [114.1840, 22.3035];

    map.init(hongKong, 12.3);
    
  });

}());