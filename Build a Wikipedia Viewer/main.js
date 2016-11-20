(function() {
  'use strict';
  
  angular
    .module('WikiSearch', [])
    .controller('MainController', MainController);
  
  MainController.$inject = ['$q', '$http', '$sce', '$interval'];

  function MainController($q, $http, $sce, $interval) {
    
    var vm = this;
    vm.query = '';
    vm.animateText = '';
    vm.animation = animation;
    vm.animateBack = animateBack;
    vm.getQueryText = getQueryText;
    vm.articles = [];

    function animation() {
      vm.animateText = 'search-text';
    }
    
    function animateBack() {
      if (vm.query.length === 0) {
        vm.animateText = 'search-text-back';
      }
    }
    
    function getQueryText() {
      vm.articles = [];
      if (vm.query.length > 2) {
        getArticles();
      }
    }
    
    function getArticles() {
      //vm.articles = [];
      var endpoint = $sce.trustAsResourceUrl('https://en.wikipedia.org/w/api.php');
      var query = '?action=opensearch&origin=*&format=json&search=';
      var queryTitle = vm.query;
      
      queryTitle = exp(queryTitle, /\s/g, '%20');
      queryTitle = exp(queryTitle, /\`/g, '%60');
      queryTitle = exp(queryTitle, /\'/g, '%27');
      queryTitle = exp(queryTitle, /\?/g, '%3F');
      queryTitle = exp(queryTitle, /\,/g, '%2C');
      
      $http.get(endpoint + query + queryTitle)
        .then(function(res) {
          getArticleArray(res.data);
      });
    }
    
    function getArticleArray(obj) {
      for (var i = 0; i < obj[1].length; i++) {
        var tempObj = {};
        tempObj.title = obj[1][i];
        tempObj.detail = obj[2][i];
        tempObj.link = obj[3][i];
        vm.articles.push(tempObj);
      }
    }
    
    function exp(string, regExp, replace) {
      var newValue = string.replace(regExp, replace);
      return newValue;
    }
  }
  
})();