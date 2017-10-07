(function() {
  
  var humanPlayer,
      aiPlayer,
      fieldElements,
      patterns = [
        [0,1,2],
        [0,4,8],
        [0,3,6],
        [1,4,7],
        [3,4,5],
        [2,5,8],
        [6,7,8],
        [2,4,6]
      ];
  
  function setWinner(whichPLayer) {
    $('.gameStatus').addClass('slideInUp');
    $('.gameStatus span').html(whichPLayer);
  }
  
  function checkWin(fields, player) {
    var plays = fields.reduce(function(acc, elem, index) {
      if (elem === player) {
        acc.push(index);
      }
      return acc;
    }, []);
    var gameWon = null;
    for (var i = 0; i < patterns.length; i++) {
      if (patterns[i].every(function(elem){ return plays.indexOf(elem) > -1 })) {
        gameWon = { index: i, player: player };
        break;
      }
    }
    return gameWon;
  }
  
  function emptyFields(board) {
    return board.filter(function(e) {
      if (typeof(e) == 'number') {
        if (e === 0) {
          return '0';
        }
        return e;
      }
    });
  }
  
  function minimax(newFields, player) {
    var availMoves = emptyFields(newFields);
    
    if (checkWin(newFields, humanPlayer)) {
      return { score: -10 };
    } else if (checkWin(newFields, aiPlayer)) {
      return { score: 10 };
    } else if (availMoves.length === 0) {
      return { score: 0 };
    }
    
    var moves = [];
    for (var i = 0; i < availMoves.length; i++) {
      var move = {};
      move.index = newFields[availMoves[i]];
      newFields[availMoves[i]] = player;
      
      if (player === aiPlayer) {
        var result = minimax(newFields, humanPlayer);
        move.score = result.score;
      } else {
        var result = minimax(newFields, aiPlayer);
        move.score = result.score;
      }
      
      newFields[availMoves[i]] = move.index;
      
      moves.push(move);
    }
    
    var bestMove;
    if (player === aiPlayer) {
      var bestScore = -10000;
      for (var i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      var bestScore = 10000;
      for (var i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }
    return moves[bestMove];
  }
  
  function bestMove() {
    return $('#' + minimax(fieldElements, aiPlayer).index);
    //return $('#' + emptyFields()[0]);
  }
  
  function checkIfTie() {
    if (emptyFields(fieldElements).length == 0) {
      for (var i = 0; i < fieldElements.length; i++) {
        $('#' + i).attr('style', 'background-color: green');
        $('.xo').off('click');
      }
      setWinner('Tie Game!');
      return true;
    }
    return false;
  }
  
  function gameOver(someoneWon) {
    for (var i = 0; i < patterns[someoneWon.index].length; i++) {
      var color = someoneWon.player == humanPlayer ? 'green' : 'red';
      $('#' + patterns[someoneWon.index][i]).attr('style', 'background-color: ' + color);
    }
    $('.xo').off('click');
    setWinner(someoneWon.player === humanPlayer ? 'You win!' : 'You loose!');
  }
  
  function checkWin(fields, player) {
    var plays = fields.reduce(function(acc, elem, index) {
      if (elem === player) {
        acc.push(index);
      }
      return acc;
    }, []);
    var gameWon = null;
    for (var i = 0; i < patterns.length; i++) {
      if (patterns[i].every(function(elem){ return plays.indexOf(elem) > -1 })) {
        gameWon = { index: i, player: player };
        break;
      }
    }
    return gameWon;
  }
  
  function turn(whichField, player) {
    fieldElements[Number(whichField.attr('id'))] = player;
    whichField.html(player);
    var someoneWon = checkWin(fieldElements, player);
    if (someoneWon) {
      gameOver(someoneWon);
    }
  }
  
  function choosingSide(elem) {
    humanPlayer = elem.data('xo');
    humanPlayer = humanPlayer.toUpperCase();
    
    if (humanPlayer === 'X') {
      aiPlayer = 'O';
    } else {
      aiPlayer = 'X';
    }
    
    $('.dBoxBg').hide();
  }
  
  function writeSign(elem) {
    if ( typeof(fieldElements[Number(elem.attr('id'))]) == 'number' ) {
      turn(elem, humanPlayer);
      if (!checkIfTie()) { turn(bestMove(), aiPlayer); }
    }
  }
  
  function onClick() {
    var $this = $(this),
        clickedElem = $this.data('which') ? $this.data('which') : Number($this.attr('id'));
    
    switch(clickedElem) {
      case 'chooseXo':
        choosingSide($this);
        break;
      case 'resetBtn':
        resetGame();
        break;
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
        writeSign($this);
        break;
    }
  }
  
  function resetGame() {
    $('.gameStatus').removeClass('slideInUp')
    $('.dBoxBg').show();
    fieldElements = Array.from(Array(9).keys());
    
    $('.xo').html('');
    $('.xo').attr('style', 'background-color: none');
    $('.xo').on('click', onClick);
    humanPlayer = '';
    aiPlayer = '';
  }
  
  function init() {
    fieldElements = Array.from(Array(9).keys());
    $('.dBoxBg').show();
        
    $('.resetBtn').on('click', onClick);
    $('.xo').on('click', onClick);
    $('.chooseXo').on('click', onClick);
  }
  
  init();
  
})();