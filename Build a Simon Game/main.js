(function() {

  var AudioContext = window.AudioContext
    || window.webkitAudioContext
    || false;

  if (!AudioContext) {
    alert('Your browser doesn\'t support Web Audio API. Please try in newer version...');
  } else {
    //************
    // SOUNDS SETUP
    var audioCtxt = new AudioContext();

    var freqs = [196, 261.63, 329.63, 392];

    var errorOscillator = audioCtxt.createOscillator();
    errorOscillator.type = 'triangle';
    errorOscillator.frequency.value = 110;
    errorOscillator.start(0.0);

    var errorNode = audioCtxt.createGain();
    errorOscillator.connect(errorNode);
    errorNode.gain.value = 0;
    errorNode.connect(audioCtxt.destination);

    var vol = 0.5,
        ramp = 0.05;

    var oscillators = freqs.map(function(frq) {
      var osc = audioCtxt.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = frq;
      osc.start(0.0);
      return osc;
    });

    var gains = oscillators.map(function(osc) {
      var g = audioCtxt.createGain();
      osc.connect(g);
      g.connect(audioCtxt.destination);
      g.gain.value = 0;
      return g;
    });
    // SOUNDS SETUP END
    //************

    //************
    // PLAY SOUNDS
    function playSuccesNote(whichBtn) {
      gains[whichBtn].gain.linearRampToValueAtTime(vol, audioCtxt.currentTime + ramp);
    }

    function stopSuccessNote() {
      gains.forEach(function(g) {
        g.gain.linearRampToValueAtTime(0, audioCtxt.currentTime + ramp);
      });
    }

    function stopErrorNote() {
      errorNode.gain.linearRampToValueAtTime(0, audioCtxt.currentTime + ramp);
    }

    function playErrorNote() {
      errorNode.gain.linearRampToValueAtTime(vol, audioCtxt.currentTime + ramp);
      setTimeout(function() {stopErrorNote();}, 1000);
    }
    // PLAY SOUNDS END
    //************

    var notesIndex = 0;
    var noteIndex = 0;
    var winnigAnimCounter = 0;
    var gameStatus = {};

    gameStatus.init = function() {
      this.power = false;
      this.strictMode = false;
      this.started = false;
      this.win = false;
      this.gameRounds = [];
      this.userRound = [];
      this.timer = null;
      this.noteLength = 600;
      this.noteBreak = 1500;
    }

    gameStatus.reset = function() {
      this.strictMode = false;
      this.win = false;
      this.gameRounds = [];
      this.userRound = [];
      this.noteBreak = 1500;
    }

    function randomNum() {
      return Math.floor(Math.random() * 4);
    }

    function testUsersInputs() {
      for (var i = 0; i < gameStatus.userRound.length; i++) {
        if (gameStatus.userRound[i] !== gameStatus.gameRounds[gameStatus.gameRounds.length - 1][i]) {
          return false;
        }
      }
      return true;
    }

    function highlightActivePad(pad) {
      var padColor = $('#' + pad).attr('class').split(' ')[1];

      switch(padColor) {
        case 'green':
          $('#' + pad).toggleClass('light-green');
          break;
        case 'red':
          $('#' + pad).toggleClass('light-red');
          break;
        case 'yellow':
          $('#' + pad).toggleClass('light-yellow');
          break;
        case 'blue':
          $('#' + pad).toggleClass('light-blue');
          break;
      }
    }

    function resetPadEventListener() {
      $('.button').on('mousedown', gamePadClicked);
      $('.button').on('mouseup', gamePadClicked);
    }

    function unsetPadEventListener() {
      $('.button').off('mousedown');
      $('.button').off('mouseup');
    }

    function decreaseNoteBreak() {
      if (gameStatus.gameRounds.length >= 9) {
        gameStatus.noteBreak = 1000;
      }
    }

    function playAndStopNote(note) {
      setTimeout(function() {
        //console.log('note: ' + note);
        stopSuccessNote();
        highlightActivePad(note);
        handleTimer();
        noteIndex++;
        //console.log('note index: ' + noteIndex);
        if (noteIndex < 2) {
          playSuccesNote(note);
          playAndStopNote(note);
        }
        if (noteIndex === 2) {
          noteIndex = 0;
        }
      }, gameStatus.noteLength);
    }

    function notesLoop(array) {
      setTimeout(function() {
        unsetPadEventListener();
        setCounter(true);
        //console.log('notes index: ' + notesIndex);
        playAndStopNote(array[notesIndex]);
        notesIndex++;
        if (notesIndex < array.length) {
          notesLoop(array);
        }
        if (notesIndex === array.length) {
          resetPadEventListener();
        }
      }, gameStatus.noteBreak);
    }

    function playTheCurrentRound(notesArray) {
      decreaseNoteBreak();
      notesIndex = 0;
      notesLoop(notesArray);
    }

    function setCounter(next) {
      if (gameStatus.started) {
        if (next) {
          $('span.counts').html(gameStatus.gameRounds.length);
        } else {
          $('span.counts').html('!!');
        }
      }
    }

    function handleTimer() {
      clearTimeout(gameStatus.timer);
      if (gameStatus.power && gameStatus.started) {
        gameStatus.timer = setTimeout(function() {
          setCounter(false);
          playErrorNote();
          generateRound();
        }, 6000);
      }
    }

    function strictModeHandler() {
      if (gameStatus.strictMode) {
        gameStatus.reset();
        gameStatus.started = true;
        generateRound(true);
      } else {
        generateRound(false);
      }
    }

    function winningAnim() {
      setTimeout(function() {
        if ($('span.counts').html()) {
          $('span.counts').html('');
        } else {
          $('span.counts').html(gameStatus.gameRounds.length);
        }
        winnigAnimCounter++;
        if (winnigAnimCounter < 5) {
          winningAnim();
        }
      }, 1000);
    }

    function checkWin() {
      if (gameStatus.gameRounds.length === 20) {
        gameStatus.win = true;
        winningAnim();
      }
    }

    function generateRound(shouldBeNewRound) {
      if (gameStatus.win) {
        return;
      }
      if (gameStatus.userRound.length) {
        if (testUsersInputs()) {
          if (gameStatus.userRound.length === gameStatus.gameRounds[gameStatus.gameRounds.length - 1].length) {
            //console.log('users notes were good, generate new round');
            checkWin();
            gameStatus.userRound = [];
            generateRound(true);
          }
        } else {
          //console.log('users notes were false, replay the same round');
          setCounter(false);
          playErrorNote();
          gameStatus.userRound = [];
          strictModeHandler();
        }
      } else {
        if (shouldBeNewRound) {
          if (gameStatus.gameRounds.length) {
            //console.log('new round');
            var newNote = randomNum();
            var newRound = gameStatus.gameRounds[gameStatus.gameRounds.length - 1].slice();
            newRound.push(newNote);
            gameStatus.gameRounds.push(newRound);
            playTheCurrentRound(newRound);
          } else {
            //console.log('first round');
            var firstNote = randomNum();
            var firstRound = [];
            firstRound.push(firstNote);
            gameStatus.gameRounds.push(firstRound);
            playTheCurrentRound(firstRound);
          }
        } else {
          //console.log('user hasn\'t notes yet, replay the same round');
          playTheCurrentRound(gameStatus.gameRounds[gameStatus.gameRounds.length - 1]);
        }
      }
    }

    function recordUserNotes(note) {
      var noteId = $(note).attr('id');
      gameStatus.userRound.push(Number(noteId));
    }

    function gamePadClicked(e) {
      if (gameStatus.started) {
        if (e.type === 'mousedown') {
          playSuccesNote($(this).attr('id'));
        } else {
          stopSuccessNote();
          handleTimer();
          recordUserNotes(e.target);
          generateRound();
        }
      }
    }

    function startButtonClicked() {
      if (!gameStatus.started) {
        gameStatus.started = !gameStatus.started;
      } else {
        gameStatus.reset();
      }
      noteIndex = 0;
      generateRound(true);
      handleTimer();
    }

    function strictButtonClicked() {
      gameStatus.strictMode = !gameStatus.strictMode;
      if (gameStatus.power) {
        $('.light').toggleClass('strict-enabled');
      } else {
        $('.light').removeClass('strict-enabled');
      }
    }

    function setEventListeners() {
      $('.button').on('mousedown', gamePadClicked);
      $('.button').on('mouseup', gamePadClicked);
      $('.start-btn').on('click', startButtonClicked);
      $('.strict-btn').on('click', strictButtonClicked);
    }

    function unsetEventListeners() {
      $('.button').off('mousedown');
      $('.button').off('mouseup');
      $('.start-btn').off('click');
      $('.strict-btn').off('click');
    }

    function powerOn() {
      gameStatus.power = !gameStatus.power;

      if (gameStatus.power) {
        $('.switch span').removeClass('slideDown').addClass('slideUp');
        $('.counts').html('--');
        setEventListeners();
      } else {
        $('.switch span').removeClass('slideUp').addClass('slideDown');
        $('.counts').html('');
        clearTimeout(gameStatus.timer);
        notesIndex = 1000;
        noteIndex = 10;
        strictButtonClicked();
        unsetEventListeners();
        gameStatus.started = false;
        gameStatus.reset();
      }
    }

    function setGame() {
      gameStatus.init();
      $('.switch').on('click', powerOn);
    }

    setGame();
  }

})();
