$(document).ready(function() {
  
  // Regular Expression for anchor elements
  var regExp = /<a[^>]*>(.*?)<\/a>/g;
  
  var currentQuote = '';
  var currentTitle = '';
  
  // Fav movie titles for searching quotes from them
  var titles = [
    'Snatch',
    'Platoon',
    'Forrest Gump',
    'The Shawshank Redemption',
    'Good Morning, Vietnam',
    'Groundhog Day',
    'Any Given Sunday',
    'Office Space',
    'The Departed',
    'Watchmen',
    'Inception',
    'Interstellar',
    'The Dark Knight',
    'The Dark Knight Rises',
    'The Lord of the Rings: The Fellowship of the Ring',
    'The Lord of the Rings: The Two Towers',
    'The Lord of the Rings: The Return of the King'
  ];
  
  // Providing 1st quote on page load
  WikiquoteApi.getRandomQuote(titles[5], function(quote) {
      var quoteText = quote.quote.replace(regExp, '');;

      $('.quote:nth-child(2) p').html(quoteText);
      $('.quote:nth-child(2) p.footer').html(quote.titles);
    
      currentQuote = $('.quote:nth-child(2) p').html();
      currentTitle = $('.quote:nth-child(2) p.footer').html();
    }, function(err) {
      console.log(err);
    });
  
  // Providing 2nd quote on page load
  WikiquoteApi.getRandomQuote(titles[7], function(quote) {

      var quoteText = quote.quote.replace(regExp, '');
      $('.quote:last-child p').html(quoteText);
      $('.quote:last-child p.footer').html(quote.titles);
    }, function(err) {
      console.log(err);
    });
  
  // Preparing href attribute value for Twitter query string
  $('#tweet').mouseenter(function() {
   
    var whole = currentQuote + currentTitle;
    
    whole = exp(whole, /\s/g, '%20');
    whole = exp(whole, /\`/g, '%60');
    whole = exp(whole, /\'/g, '%27');
    whole = exp(whole, /\?/g, '%3F');
    whole = exp(whole, /\,/g, '%2C');
    
    $('.buttons a').attr('href', 'https://twitter.com/intent/tweet?text=' + whole);
  });
  
  // Generating the next quote to show and managing CSS animations
  $('#next-quote').on('click', function() {
    
    var randomNumber = Math.floor(Math.random() * 18);
    
    WikiquoteApi.getRandomQuote(titles[randomNumber], function(quote) {
      
       var quoteText = quote.quote.replace(regExp, '');
      
       if ($('.quote').hasClass('animate-lift')) {
        $('.quote.animate-lift p').html(quoteText);
        $('.quote.animate-lift p.footer').html(quote.titles);
      }
      
      if ($('.quote:nth-child(2)').hasClass('animate-lift')) {
        $('.quote:nth-child(2)').removeClass('animate-lift').addClass('animate-slide');
      } else {
        $('.quote:nth-child(2)').removeClass('animate-slide').addClass('animate-lift');
      }

      if ($('.quote:last-child').hasClass('animate-slide')) {
        $('.quote:last-child').removeClass('animate-slide').addClass('animate-lift');
      } else {
        $('.quote:last-child').removeClass('animate-lift').addClass('animate-slide');
      }
      
      // Storing string for possible Twitter post
      currentQuote = $('.quote.animate-slide p').html();
      currentQuote += ' ';
      currentTitle = $('.quote.animate-slide p.footer').html();
      
    }, function(err) {
      console.log(err);
    });
    
  });
  
  // Shorter function for using replace method
  function exp(string, regExp, replace) {
    var newValue = string.replace(regExp, replace);
    return newValue;
  }
  
});
  
  
/*
    Thanks for the wikiquotes-api by Nate Tyler!
    https://github.com/natetyler/wikiquotes-api/
*/
  
var WikiquoteApi = (function() {

  var wqa = {};

  var API_URL = "https://en.wikiquote.org/w/api.php";

  /**
   * Query based on "titles" parameter and return page id.
   * If multiple page ids are returned, choose the first one.
   * Query includes "redirects" option to automatically traverse redirects.
   * All words will be capitalized as this generally yields more consistent results.
   */
  wqa.queryTitles = function(titles, success, error) {
    $.ajax({
      url: API_URL,
      dataType: "jsonp",
      data: {
        format: "json",
        action: "query",
        redirects: "",
        titles: titles
      },

      success: function(result, status) {
        var pages = result.query.pages;
        var pageId = -1;
        for(var p in pages) {
          var page = pages[p];
          // api can return invalid recrods, these are marked as "missing"
          if(!("missing" in page)) {
            pageId = page.pageid;
            break;
          }
        }
        if(pageId > 0) {
          success(pageId);
        } else {
          error("No results");
        }
      },

      error: function(xhr, result, status){
        error("Error processing your query");
      }
    });
  };

  /**
   * Get the sections for a given page.
   * This makes parsing for quotes more manageable.
   * Returns an array of all "1.x" sections as these usually contain the quotes.
   * If no 1.x sections exists, returns section 1. Returns the titles that were used
   * in case there is a redirect.
   */
  wqa.getSectionsForPage = function(pageId, success, error) {
    $.ajax({
      url: API_URL,
      dataType: "jsonp",
      data: {
        format: "json",
        action: "parse",
        prop: "sections",
        pageid: pageId
      },

      success: function(result, status){
        var sectionArray = [];
        var sections = result.parse.sections;
        for(var s in sections) {
          var splitNum = sections[s].number.split('.');
          if(splitNum.length > 1 && splitNum[0] === "1") {
            sectionArray.push(sections[s].index);
          }
        }
        // Use section 1 if there are no "1.x" sections
        if(sectionArray.length === 0) {
          sectionArray.push("1");
        }
        success({ titles: result.parse.title, sections: sectionArray });
      },
      error: function(xhr, result, status){
        error("Error getting sections");
      }
    });
  };

  /**
   * Get all quotes for a given section.  Most sections will be of the format:
   * <h3> title </h3>
   * <ul>
   *   <li> 
   *     Quote text
   *     <ul>
   *       <li> additional info on the quote </li>
   *     </ul>
   *   </li>
   * <ul>
   * <ul> next quote etc... </ul>
   *
   * The quote may or may not contain sections inside <b /> tags.
   *
   * For quotes with bold sections, only the bold part is returned for brevity
   * (usually the bold part is more well known).
   * Otherwise the entire text is returned.  Returns the titles that were used
   * in case there is a redirect.
   */
  wqa.getQuotesForSection = function(pageId, sectionIndex, success, error) {
    $.ajax({
      url: API_URL,
      dataType: "jsonp",
      data: {
        format: "json",
        action: "parse",
        noimages: "",
        pageid: pageId,
        section: sectionIndex
      },

      success: function(result, status){
        var quotes = result.parse.text["*"];
        var quoteArray = []

        // Find top level <li> only
        var $lis = $(quotes).find('li:not(li li)');
        $lis.each(function() {
          // Remove all children that aren't <b>
          $(this).children().remove(':not(b)');
          var $bolds = $(this).find('b');

          // If the section has bold text, use it.  Otherwise pull the plain text.
          if($bolds.length > 0) {
            quoteArray.push($bolds.html());
          } else {
            quoteArray.push($(this).html());
          }
        });
        success({ titles: result.parse.title, quotes: quoteArray });
      },
      error: function(xhr, result, status){
        error("Error getting quotes");
      }
    });
  };

  /**
   * Search using opensearch api.  Returns an array of search results.
   */
  wqa.openSearch = function(titles, success, error) {
    $.ajax({
      url: API_URL,
      dataType: "jsonp",
      data: {
        format: "json",
        action: "opensearch",
        namespace: 0,
        suggest: "",
        search: titles
      },

      success: function(result, status){
        success(result[1]);
      },
      error: function(xhr, result, status){
        error("Error with opensearch for " + titles);
      }
    });
  };

  /**
   * Get a random quote for the given title search.
   * This function searches for a page id for the given title, chooses a random
   * section from the list of sections for the page, and then chooses a random
   * quote from that section.  Returns the titles that were used in case there
   * is a redirect.
   */
  wqa.getRandomQuote = function(titles, success, error) {

    var errorFunction = function(msg) {
      error(msg);
    };

    var chooseQuote = function(quotes) {
      var randomNum = Math.floor(Math.random()*quotes.quotes.length);
      success({ titles: quotes.titles, quote: quotes.quotes[randomNum] });
    };

    var getQuotes = function(pageId, sections) {
      var randomNum = Math.floor(Math.random()*sections.sections.length);
      wqa.getQuotesForSection(pageId, sections.sections[randomNum], chooseQuote, errorFunction);
    };

    var getSections = function(pageId) {
      wqa.getSectionsForPage(pageId, function(sections) { getQuotes(pageId, sections); }, errorFunction);
    };

    wqa.queryTitles(titles, getSections, errorFunction);
  };

  /**
   * Capitalize the first letter of each word
   */
  wqa.capitalizeString = function(input) {
    var inputArray = input.split(' ');
    var output = [];
    for(s in inputArray) {
      output.push(inputArray[s].charAt(0).toUpperCase() + inputArray[s].slice(1));
    }
    return output.join(' ');
  };

  return wqa;
}());
  
