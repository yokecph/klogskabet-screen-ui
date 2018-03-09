const common = require('common/common.js');
const $ = common.jQuery;
const loader = common.loadingOverlay;

const IDLE_TIMEOUT = 60000; // 60 sec
const IDLING_INTERVAL = 5000; // 5 sec

// "Globals"
var $ranks; // gets assigned once content has loaded
var $options; // gets assigned once content has loaded
var $title = $('#quiz h1');
var $subtitle = $('#quiz h2');
var $result = $('#result');
var $resultTitle = $('#result h1');

// The JSON content (gets assigned once loaded)
var content = null;

// Load content
common.content.load((json) => {
  content = json;

  // set titles
  $title.setLocalizedText(json, 'title');
  $subtitle.setLocalizedText(json, 'subtitle');
  $resultTitle.setLocalizedText(json, 'result_title');

  // create list items for the draggable options, and the "ranks" drop zones
  json.options.forEach(option => {
    $('<li></li>')
      .setLocalizedText(option, 'option')
      .data({
        info: option
      })
      .appendTo('#options');

    $('#ranks').append('<li></li>');
  });

  // assign "globals"
  $ranks = $('ol#ranks li');
  $options = $('ul#options li');

  loader.remove();

  fixLayout();
  idle();
});


// The CSS styles handles initial layout on its own, then this function locks
// the elements into place with position: absolute, so the options can be moved
// around and the ranks/drop zones are in known positions.
// The position-fixing is done in reverse (from the bottom of the list),
// because if we start from the top the li elements below will reflow, and
// change position before we have a chance to fix them in place
function fixLayout() {

  // simple helper function
  function fixPosition(element) {
    var $element = $(element);
    var pos = $element.position();
    $element.css({
      position: 'absolute',
      top: `${pos.top}px`,
      left: `${pos.left}px`
    });
    return pos;
  }

  // Fix options
  $options.get().reverse().forEach(function (li, i) {
    var pos = fixPosition(li);

    // store that position as its "original" position (used when dragging an
    // option away from the drop zones)
    $(li).data({
      original: {
        top: `${pos.top}px`,
        left: `${pos.left}px`,
      }
    });
  });

  // fix drop zone elements
  $ranks.get().reverse().forEach(fixPosition);
}

// find the current drop target (i.e. hit-detection on the rank li element)
// returns a jQuery-wrapped element or null.
function getDropTarget(x, y) {
  var target = $ranks.get().find(function (el) {
    var item = $(el);

    var offset = item.offset();
    if (x > offset.left && x < offset.left + item.outerWidth()) {
      if (y > offset.top && y < offset.top + item.outerHeight()) {
        return item;
      }
    }
    return false;
  });

  return target ? $(target) : null;
}

// Put options back to their original, but scrambled so they're not always
// in the same order
function resetAndScramble() {
  // get the original top-offsets for the options
  var topOffsets = $options.get().map(function (li) {
    return $(li).data('original').top;
  });

  // scramble the top offsets
  var scrambledOffsets = [];
  while (topOffsets.length) {
    var i = topOffsets.length * Math.random() | 0;
    scrambledOffsets.push(topOffsets[i]);
    topOffsets.splice(i, 1);
  }

  // give the options their new top offset, and animate them falling back into
  // place
  scrambledOffsets.forEach(function (offset, i) {
    $($options[i]).data('original').top = offset;
    $($options[i]).animate({
      top: offset,
      left: $($options[i]).data('original').left
    }, 100);
  });

  // clear all references
  $options.data('rank', null);
  $ranks.data('option', null);
}

// Place an option on a rank/drop zone, animating it into place as necessary,
// and setting a reference between the option and the rank and vice-versa
function placeOption(option, rank) {
  option.animate({
    top: rank.position().top,
    left: '-675px' // TODO: Sorry for the hard-coded value
  }, 100).data('rank', rank);

  $(rank).data('option', option);
}

// Move an option back to its original position, and remove option-rank
// references
function resetOption(option) {
  option.animate({
    top: option.data('original').top,
    left: option.data('original').left
  }, 100);

  if (option.data('rank')) {
    option.data('rank').data('option', null);
    option.data('rank', null);
  }
}

// show the result
function showResult() {
  $title.setLocalizedText(content, 'comparison_title');
  $subtitle.hide();

  // clear the results list
  var results = $('#results');
  results.html('');

  // populate the results list in option order from top to bottom
  $options.get().sort(function (a, b) {
    return $(a).position().top > $(b).position().top;
  }).forEach(function (option, i) {
    var $option = $(option);
    var info = $option.data('info');

    $('<li></li>')
      .setLocalizedText(info, 'answer')
      .appendTo(results);
  });

  $result.show();
  $('#show-result').addClass('disabled');
}

// reset the quiz (hide the result and shuffle answers)
function resetQuiz() {
  $title.setLocalizedText(content, 'title');

  $subtitle.show();

  $result.hide();
  resetAndScramble();
}

var idleTimeout = null;
var idlingInterval = null;

// start waiting for idle timeout
function startIdleTimeout() {
  clearIdleTimeouts();
  idleTimeout = setTimeout(idle, IDLE_TIMEOUT);
}

// clear idle timeouts
function clearIdleTimeouts() {
  $('#call-to-action').hide();
  clearTimeout(idleTimeout);
  clearTimeout(idlingInterval);
  $options.removeClass('wiggle');
}

// this function is called periodically when the device is idling.
// it "wiggles" a random answer to indicate they can be moved
function idle() {
  clearIdleTimeouts();

  const anyPlaced = $options.get().some(option => $(option).data('rank'));

  if ($('#result:visible').length || anyPlaced) {
    resetQuiz();
  }

  $('#call-to-action').show();

  // pick a random option to wiggle
  var option = $options.not('.wiggle')[$options.length * Math.random() | 0];
  $(option).addClass('wiggle');

  idlingInterval = setTimeout(idle, IDLING_INTERVAL);
}

// set up an event handler for moving the options around
// The mouse event are for preview support on a non-touchscreen devices
$(document).on('touchstart mousedown', '#options li', function (e) {
  startIdleTimeout();

  // skip if we're comparing answers, since the options are locked in place
  // during this
  if ($('#result:visible').length) {
    return;
  }

  // disable the compare answers button while moving things
  $('#show-result').addClass('disabled');

  var touch = /mouse/.test(e.type) ? e.originalEvent : e.originalEvent.touches.item(0);

  var item = $(this);
  var sx = touch.clientX;
  var sy = touch.clientY;
  var offsetX = parseFloat(item.css('left'));
  var offsetY = parseFloat(item.css('top'));
  var dropTarget = null;

  // bring option to front
  item.parent().append(item.detach());

  // drag handler
  function drag(e) {
    var touch = /mouse/.test(e.type) ? e.originalEvent : e.originalEvent.touches.item(0);

    // get the dragging delta
    var x = touch.clientX;
    var y = touch.clientY;
    var deltaX = x - sx;
    var deltaY = y - sy;

    var left = offsetX + deltaX;
    var top = offsetY + deltaY;

    item.css({
      left: left + "px",
      top: top + "px"
    });

    // update drop target
    dropTarget = getDropTarget(x, y);

    return false;
  }

  // add a move/drag handler
  $(document).on('touchmove mousemove', drag);

  // remove the move handler once the touch ends
  $(document).one('touchend mouseup', function (e) {
    startIdleTimeout();

    if (!dropTarget) {
      // if there's no drop target, move the option back to its original
      // position and remove references
      resetOption(item);

    } else {
      // if there is a rank/drop target, remove the option's previous rank
      // (if any) and animate the option into place. If the drop target is
      // occupied already, swap positions/move the occupier back

      var prevRank = item.data('rank');
      if (prevRank) {
        item.data('rank', null);
        prevRank.data('option', null);
      }

      var occupier = dropTarget.data('option');
      if (occupier) {
        if (prevRank) {
          placeOption(occupier, prevRank);
        } else {
          resetOption(occupier);
        }
      }

      // finally place the dragged option on the rank
      placeOption(item, dropTarget);
    }

    // check if everything's been answered
    var allPlaced = $options.get().every(function (option) {
      return $(option).data('rank');
    });

    // enable the show-result button if everything's been answered
    $('#show-result').toggleClass('disabled', !allPlaced);

    // remove the move/drag handler again
    $(document).off('touchmove mousemove', drag);
  });
});

// show result on button press
$('#show-result').on('click', function (event) {
  startIdleTimeout();


  if (!$(this).hasClass('disabled')) {
    showResult();
  }

  return event.kill()
});

// reset quiz on button press
$('#back-to-quiz').on('click', function (event) {
  resetQuiz();
  return event.kill()
});

// hide call-to-action when touched
$('#call-to-action').on('touchstart mousedown', function (event) {
  clearIdleTimeouts();
  $(this).hide();
  return event.kill()
});
