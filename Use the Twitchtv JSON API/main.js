(function() {
  
  'use strict';
  
  angular
    .module('Twitch', [])
    .controller('TwitchController', TwitchController);
  
  function TwitchController($http, $sce, $jsonpCallbacks) {
    
    var vm = this;
    var apiEndpoint = 'https://wind-bow.hyperdev.space/twitch-api';
    var stream = '/streams/';
    var channel = '/channels/';
    $sce.trustAsResourceUrl(apiEndpoint);
    
    var userNames = [
      "ESL_SC2",
      "OgamingSC2",
      "cretetion",
      "freecodecamp",
      "storbeck",
      "habathcx",
      "RobotCaleb",
      "noobs2ninjas",
      "brunofin"
    ];
    
    vm.streams = [];
    vm.streamDetails = streamDetails;
    vm.showDetails = [];
    
    getStreamData(userNames);
    
    ///////////////////////////
    
    function getStreamData(names) {
      
      for (var i = 0; i < names.length; i++) {
        var callback = 'angular.callbacks._' + i;
        
        $http({
          method: 'JSONP',
          url: apiEndpoint + stream + names[i],
          params: {'callback': callback}
        }).then(function(res) {
            if (!res.data.error) {
              res.data.channelName = res.data._links.channel.slice(38, res.data._links.channel.length);
            }
            vm.streams.push(res.data);
        }, function(res) {
          console.log(res.status);
        });
      }
    }
    
    function streamDetails(stream) {
      if (stream.stream) {
        if (vm.showDetails[vm.streams.indexOf(stream)]) {
          vm.showDetails[vm.streams.indexOf(stream)] = false;
        } else {
          vm.showDetails[vm.streams.indexOf(stream)] = true;
        }
      }
    }
    
  }
  
})();