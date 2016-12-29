(function() {
  
  var variables = {
    numbers: [],
    operations: [],
    isOperation: false
  };
  
  function rounding(number) {
    var factor = Math.pow(10, 8);
    var tempNumber = number * factor;
    var roundedNumber = Math.round(tempNumber);
    return roundedNumber / factor;
  }
  
  function writeOut(value) {
    if (value !== '.' && $('.chars').html() == 0 && $('.chars').html().length === 1) {
      $('.chars').html('');
    }
    
    var display = $('.chars'),
        currentChars = display.html();
    
    if (variables.isOperation) {
      $('.chars').html(value);
    } else {
      display.html(currentChars + value);
    }
    variables.isOperation = false;
  }
  
  function writeOutOperation(text) {
    var currentText = $('.operationsInfo').html();
    if (text === 'c' || text === 'ac' || text === 'C' || text === 'AC') {
      $('.operationsInfo').html('');
    } else {
      $('.operationsInfo').html(currentText + text);
    }
  }
  
  function operation(number, op) {
    
    function writeArrays() {
      variables.numbers.push(number);
      variables.operations.push(op);
    }
    
    function clearArray() {
      variables.operations.shift();
      variables.numbers = [];
    }
    
    function calc() {
      variables.result ? variables.numbers.splice(0, 0, variables.result) : delete variables.result;

      if (variables.numbers.length > 1) {
        switch(variables.operations[0]) {
          case '+':            
            variables.result = Number(variables.numbers[0]) + Number(variables.numbers[1]);
            clearArray();
            writeOut(variables.result);
            break;
          case '-':
            variables.result = Number(variables.numbers[0]) - Number(variables.numbers[1]);
            clearArray();
            writeOut(variables.result);
            break;
          case 'X':
            variables.result = Number(variables.numbers[0]) * Number(variables.numbers[1]);
            clearArray();
            writeOut(variables.result);
            break;
          case '÷':
            variables.result = Number(variables.numbers[0]) / Number(variables.numbers[1]);
            clearArray();
            writeOut(variables.result);
            break;
        }
        variables.isOperation = true;
      }
    }
    
    function getResult() {
      writeArrays();
      calc();
    }
    
    getResult();
  }
  
  function equals() {
    operation($('.chars').html());
    
    variables.operations = [];
    variables.numbers = [];
    variables.result = rounding(variables.result);
    writeOut(variables.result);
    writeOutOperation('=' + variables.result);
    delete variables.result;
  }
  
  function clearScreen() {
    delete variables.result;
    variables.operations = [];
    var display = $('.chars');
    display.html('0');
  }
  
  function operate() {
    var $this = $(this);
    var val = $(this).data('value');
    
    $this.addClass('clicked');
    setTimeout(function() {
      $this.removeClass('clicked');
    }, 200)
    
    if (typeof(val) === 'number') {
      if ($('.chars').html().length >= 10) {
        return $('.operationsInfo').html('Character limit');
      } else {
        writeOut(Number(val));
        writeOutOperation(val);
      }
    } else {
      switch(val) {
        case 'AC':
        case 'C':
          writeOutOperation(val);
          clearScreen();
          break;
        case '.':
          writeOutOperation(val);
          writeOut(val);
          break;
        case '+':
        case '-':
        case 'X':
        case '÷':
          variables.isOperation = true;
          writeOutOperation(val);
          operation($('.chars').html(), val);
          break;
        case '=':
          variables.isOperation = true;
          equals();
          break;
      }
    }
  }
  
  function keyDownEvent(event) {
    var key = String.fromCharCode(event.which);
    
    switch(key) {
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '.':
        writeOutOperation(key);
        writeOut(key);
        break;
      case '+':
      case '-':
      case '*':
      case '/':
        variables.isOperation = true;
        writeOutOperation(key);
        operation($('.chars').html(), key);
        break;
      case 'c':
        writeOutOperation(key);
        clearScreen();
        break;
      case '=':
        variables.isOperation = true;
        equals();
        break;
    }
  }
  
  function init() {
    $('.chars').html('0');
    $('.button').on('click', operate);
    $(document).keypress(keyDownEvent.bind(event));
  }
  
  init();
  
})();