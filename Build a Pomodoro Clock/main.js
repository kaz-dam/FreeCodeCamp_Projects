(function() {
  
  var startToggle = true,
      isSession = true,
      isCounting = false,
      interval;
    
  function counting() {
    var minuteElem1 = $('.upper-minute span'),
        minuteElem2 = $('.down-minute span'),
        secondElem1 = $('.upper-seconds span'),
        secondElem2 = $('.down-seconds span'),
        minDiv = $('.upper-minute'),
        secDiv = $('.upper-seconds'),
        sec = secondElem1.html(),
        min;
        
    if (isSession) {
      min = $('#sessionNumber').html();
      $('.breakSetting p').removeClass('highlightBreak');
      $('.sessionSetting p').addClass('highlightSession');
    } else {
      min = $('#breakNumber').html();
      $('.breakSetting p').addClass('highlightBreak');
      $('.sessionSetting p').removeClass('highlightSession');
    }
    
    interval = setInterval(function() {
      if (sec === '00') {
        sec = '60';
        var tempMinArr = min.split('');
        if (Number(tempMinArr[0]) === 0) {
          Number(tempMinArr[1]);
          tempMinArr[1] = tempMinArr[1] - 1;
          min = tempMinArr.join('');
          minDiv.addClass('flipNumbers');
          setTimeout(function() {
            minDiv.removeClass('flipNumbers');
          }, 200);
          minuteElem1.html(min);
          minuteElem2.html(min);
        } else {
          Number(min);
          min = min - 1;
          min = min.toString();
          if (min.length <= 1) {
            min = '0' + min;
          }
          minDiv.addClass('flipNumbers');
          setTimeout(function() {
            minDiv.removeClass('flipNumbers');
          }, 200);
          minuteElem1.html(min);
          minuteElem2.html(min);
        }
      }

      var tempArr = sec.split(''),
          tempSec = sec;
      
      if (Number(tempArr[0]) === 0) {
        Number(tempArr[1]);
        tempArr[1] = tempArr[1] - 1;
        sec = tempArr.join('');
        secDiv.addClass('flipNumbers');
        setTimeout(function() {
          secDiv.removeClass('flipNumbers');
        }, 200);
        secondElem1.html(sec);
        secondElem2.html(sec);
      } else {
        Number(tempSec);
        sec = tempSec - 1;
        sec = sec.toString();
        if (sec.length <= 1) {
          sec = '0' + sec;
        }
        secDiv.addClass('flipNumbers');
          setTimeout(function() {
            secDiv.removeClass('flipNumbers');
          }, 200);
        secondElem1.html(sec);
        secondElem2.html(sec);
      }
      
      if (min === '00' && sec === '00') {
        if (isSession) {
          isSession = false;
        } else {
          isSession = true;
        }
        clearInterval(interval);
        counting();
      }
    }, 1000);
  }
  
  function startTimer(elem) {
    if (startToggle) {
      elem.html('Stop');
      isCounting = true;
      startToggle = false;
      counting();
    } else {
      elem.html('Start');
      isCounting = false;
      startToggle = true;
      clearInterval(interval);
    }
  }
  
  function setMainCounter(number, element) {
    if (element.data('elem') === 'session') {
      if (!isCounting && isSession) {
        if (number < 10) {
          $('.upper-minute span').html('0' + number);
          $('.down-minute span').html('0' + number);
        } else {
          $('.upper-minute span').html(number);
          $('.down-minute span').html(number);
        }
        $('.upper-seconds span').html('00');
        $('.down-seconds span').html('00');
      }
    } else {
      if (!isCounting && !isSession) {
        if (number < 10) {
          $('.upper-minute span').html('0' + number);
          $('.down-minute span').html('0' + number);
        } else {
          $('.upper-minute span').html(number);
          $('.down-minute span').html(number);
        }
        $('.upper-seconds span').html('00');
        $('.down-seconds span').html('00');
      }
    }
  }
  
  function changeNumber(elem, num, direction) {
    if (num <= 0 && direction === 'decr') {
      return;
    }
    
    if (!isCounting) {
      elem.removeClass();
      setTimeout(function() {
        switch(direction) {
          case 'decr':
            num--;
            elem.addClass('slideNumberLeft');
            setTimeout(function() {
              elem.html(num);
            }, 250);
            setMainCounter(num, elem);
            break;
          case 'incr':
            num++;
            elem.addClass('slideNumberRight');
            setTimeout(function() {
              elem.html(num);
            }, 250);
            setMainCounter(num, elem);
            break;
        }
      }, 10);
    }
  }
  
  function setSession(self) {
    var displayedNumber = $('#sessionNumber').html(),
        getElement = $('#sessionNumber'),
        dir = self.data('dir');
    
    changeNumber(getElement, displayedNumber, dir);
  }
  
  function setBreak(self) {
    var displayedNumber = $('#breakNumber').html(),
        getElement = $('#breakNumber'),
        dir = self.data('dir');
    
    changeNumber(getElement, displayedNumber, dir);
  }
  
  function onClick() {
    var $this = $(this),
        clicked = $(this).data('elem');
    
    if (clicked === 'break') {
      setBreak($this);
    } else if (clicked === 'session') {
      setSession($this);
    } else {
      startTimer($this);
    }
  }
  
  function init() {
    var onloadMinute = $('#sessionNumber').html();
    
    $('.upper-minute span').html(onloadMinute);
    $('.down-minute span').html(onloadMinute);
    
    $('.breakSetting .button').on('click', onClick);
    $('.sessionSetting .button').on('click', onClick);
    $('.settings .start').on('click', onClick);
  }
  
  init();
  
})();