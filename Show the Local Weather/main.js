$(document).ready(function() {
  var city = '';
  var country = '';
  var coords = '';
  var weatherInfo = '';
  var tempToggle = true;
  
  $.get('https://ipinfo.io', function(pos) {
    city = pos.city;
    country = pos.country;
    coords = pos.loc;
    $('.weather-info p').html(city + ', ' + country);
    var coordsArr = getCoords(coords);
    getWeatherInfo(coordsArr[0], coordsArr[1]);
  }, 'jsonp');
  
  $('.fa-arrow-up').on('click', function() {
    metricToImperial();
  });
  
  function outputTemp(obj) {
    $('.temp span:first-child').html(obj.main.temp.toFixed(0));
    $('.weather-main').html(obj.weather[0].main);
    return obj.weather[0].id;
  }
  
  function metricToImperial() {
    if (tempToggle) {
      var metric = $('.temp span').html();
      var imperial = (metric * 9/5) + 32;
      $('.temp span:first-child').html(imperial);
      $('.temp span:last-child').html('F');
      tempToggle = false;
    } else {
      imperial = $('.temp span').html();
      metric = (imperial - 32) / (9/5);
      $('.temp span:first-child').html(metric.toFixed(0));
      $('.temp span:last-child').html('C');
      tempToggle = true;
    }
  }
  
  function getWeatherInfo(lat, long) {
    $.get('http://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + long + '&units=metric&appid=5f6d48e839f778714a257e617ef0c9d1', function(res) {
      weatherInfo = outputTemp(res);
      weatherBg(weatherInfo);
    }, 'jsonp');
  }
  
  function weatherBg(weatherId) {
    var getCurrentHour = getHour();
    
    if (weatherId <= 321) { // storm
      storm(getCurrentHour);
    } else if (500 <= weatherId && weatherId <= 531) { // rain
      rain(getCurrentHour);
    } else if (600 <= weatherId && weatherId <= 622) { // snow
      snow(getCurrentHour);
    } else if (701 <= weatherId && weatherId <= 781) { // atmo
      atmo(getCurrentHour);
    } else if (weatherId == 800) { // clear
      clear(getCurrentHour);
    } else if (801 <= weatherId && weatherId <= 804) { // cloudy
      cloudy(getCurrentHour);
    } else if (900 <= weatherId && weatherId <= 962) { // extremeEtc
      extremeEtc(getCurrentHour);
    }
  }
  
  function getCoords(val) {
    var arr = val.split(',');
    return arr;
  }
  
  function getHour() {
    var date = new Date();
    return date.getHours();
  }
  
  function storm(hour) {
    if (6 <= hour && hour <= 20) {
      $('body').css('background', 'linear-gradient(#E4F6F8, #6c898c)');
    } else {
      $('body').css({
        'background': 'linear-gradient(#301860, #001848)',
        'color': '#fff'
      });
    }
    $('.rain, .clouds').removeClass('hide');
    $('.clouds .first-row').addClass('animate-cloud-first-row');
    $('.clouds .second-row').addClass('animate-cloud-second-row');
  }
  
  function rain(hour) {
    console.log(hour);
    if (20 <= hour || hour <= 6) {
      $('body').css({
        'background': 'linear-gradient(#301860, #001848)',
        'color': '#fff'
      });
      $('.rain, .clouds, .moon').removeClass('hide');
    } else {
      $('.rain, .clouds, .sun').removeClass('hide');
    }
  }
  
  function snow(hour) {
    if (6 <= hour || hour <= 20) {
      $('body').css('background', 'linear-gradient(#E4F6F8, #6c898c)');
    } else {
      $('body').css({
        'background': 'linear-gradient(#301860, #001848)',
        'color': '#fff'
      });
    }
    $('.snow, .clouds').removeClass('hide');
  }
  
  function atmo(hour) {
    if (6 <= hour || hour <= 20) {
      $('body').css('background', 'linear-gradient(#E4F6F8, #6c898c)');
    } else {
      $('body').css({
        'background': 'linear-gradient(#301860, #001848)',
        'color': '#fff'
      });
    }
    $('.clouds').removeClass('hide');
  }
  
  function clear(hour) {
    if (6 <= hour || hour <= 20) {
      $('.sun').removeClass('hide');
    } else {
      $('.moon').removeClass('hide');
      $('body').css({
        'background': 'linear-gradient(#301860, #001848)',
        'color': '#fff'
      });
    }
  }
  
  function cloudy(hour) {
    if (6 <= hour || hour <= 20) {
      $('.sun').removeClass('hide');
    } else {
      $('.moon').removeClass('hide');
      $('body').css({
        'background': 'linear-gradient(#301860, #001848)',
        'color': '#fff'
      });
    }
    $('.clouds').removeClass('hide');
  }
  
  function extremeEtc(hour) {
    if (6 <= hour || hour <= 20) {
      $('body').css('background', 'linear-gradient(#E4F6F8, #6c898c)');
    } else {
      $('body').css({
        'background': 'linear-gradient(#301860, #001848)',
        'color': '#fff'
      });
    }
    $('.clouds').removeClass('hide');
    $('.clouds .first-row').addClass('animate-cloud-first-row');
    $('.clouds .second-row').addClass('animate-cloud-second-row');
  }
  
});