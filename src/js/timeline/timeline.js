/*

The following code is targeting Firefox for Android specifically.

*/

const common = require('common/common.js');
const hammer = require('hammerjs');
const $ = common.jQuery;

var intervals = [];

common.content.load(function (json) {
  var element = $('article.interval');

  $('#timeline-title').setLocalizedText(json, 'title');

  intervals = json.intervals;

  json.intervals.forEach(function (obj, i) {
    //obj.url = `/assets/timeline/${i+1}.jpg`;

    if (i % 2 === 0) {
      element.find('header').addClass('theme-color-background').removeClass('theme-color-text');
    } else {
      element.find('header').removeClass('theme-color-background').addClass('theme-color-text');
    }

    element.find('h2').setLocalizedText(obj, 'title');
    element.find('.poster').css({
      'background-image': `url(${obj.images[0].url})`
    });

    element.data('info', obj);

    if (!element.parent().length) {
      $('#timeline-overview article.interval:last-of-type').after(element);
    }

    element = element.clone();
  });

  var count = $('.interval').length;
  var width = $('#timeline-overview').children().get().reduce((sum, el) => {
    return sum + $(el).outerWidth();
  }, 0);
  $('#timeline-overview').css({width: `${width}px`});

  if (count % 2 !== 0) {
    $('#timeline-overview .interval-bookend:last-of-type').addClass('low');
  }

});

const IDLE_TIMEOUT = 90000; // 1,5 mins
const IDLING_INTERVAL = 20000; // 20 sec
var idleTimeout = null;
var idlingInterval = null;

// start waiting for idle timeout
function startIdleTimeout() {
  clearIdleTimeouts();
  idleTimeout = setTimeout(idle, IDLE_TIMEOUT);
}

startIdleTimeout();

// clear idle timeouts
function clearIdleTimeouts() {
  $('#call-to-action').hide();
  clearTimeout(idleTimeout);
  clearTimeout(idlingInterval);
}

// this function is called the device starts idling
function idle() {
  clearIdleTimeouts();
  hideInterval();
  $('#call-to-action').show();
}

// add some custom scrolling behavior for the timeline overview
// Either the iDisplay or the Android OS (not just Firefox) seems to limit
// regular, built-in scrolling to 350-400px, no matter how far you drag your
// fingers. So, while this is not very attractive, it's necessary to achieve
// nicer scrolling behavior
// The mouse event are for preview support on a non-touchscreen devices
var scrolling = false;
(function () {

  $(document).on('touchstart mousedown', function (e) {
    var touch = /mouse/.test(e.type) ? e.originalEvent : e.originalEvent.touches.item(0);

    var timeline = $('#timeline-overview');
    var maxScroll = 1920 - timeline.outerWidth(); // NOTE: Hard-coded width to make things work in preview

    var sx = touch.clientX;
    var offset = timeline.data('left') || 0; // get current "scroll offset"

    scrolling = true;

    function scrollHorizontally(e) {
      // get the scrolling delta
      var touch = /mouse/.test(e.type) ? e.originalEvent : e.originalEvent.touches.item(0);

      var delta = touch.clientX - sx;

      // get the new scroll offset, clamped to the timeline's size
      var left = Math.max(maxScroll, Math.min(0, offset + delta));

      timeline.css({
        transform: `translate(${left}px, 0px)`
      }).data({
        left: left
      });

      e.preventDefault();
      return false;
    }

    // add a move handler
    $(document).on('touchmove mousemove', scrollHorizontally);

    // remove the move handler once the touch ends
    $(document).one('touchend mouseup', function () {
      scrolling = false;
      $(document).off('touchmove mousemove', scrollHorizontally);
    });

    startIdleTimeout();
  });

}());


function showInterval(info) {
  if (!info) return;

  $('#timeline-overview').animate({
    top: "-1080px"
  });

  var interval = $('#timeline-interval');
  interval.data('info', info);

  interval.find('h1').not('#timeline-title').setLocalizedText(info, 'title');
  interval.find('h2').setLocalizedText(info, 'subtitle');
  interval.find('#description-body').setLocalizedText(info, 'description_html', true);

  var images = info.images;

  interval.find('#main, #extra-1, #extra-2')
    .css({ 'background-image': 'none' })
    .data('image', null);

  showIntervalImage(images[0]);

  images.slice(1).forEach((image, i) => {
    interval.find(`#extra-${i+1}`).css({
      'background-image': `url(${image.url})`
    }).data('image', image);
  });

  interval.animate({
    top: "0px"
  });

  const before = intervals.indexOf(info);
  const after = intervals.length - before - 1;
  const beforeFolds = $('.fold').not('.inverted').get();
  const afterFolds = $('.fold.inverted').get();
  beforeFolds.forEach((fold, i) => $(fold).toggle(i < before));
  afterFolds.forEach((fold, i) => $(fold).toggle(i < after));

  startIdleTimeout();
}

function showIntervalImage(image, origin) {
  var main = $('#timeline-interval #main');
  var current = main.data('image');
  main.css({
    'background-image': `url(${image.url})`
  }).data('image', image);
  $('#timeline-interval #image-title').setLocalizedText(image, 'description');
  $('#timeline-interval #image-source').setLocalizedText(image, 'source');

  if (origin) {
    $(origin).css({
      'background-image': `url(${current.url})`
    }).data('image', current);
  }

  startIdleTimeout();
}

function hideInterval() {
  $('#timeline-overview').animate({
    top: "0px"
  });

  $('#timeline-interval').animate({
    top: "1080px"
  });

  startIdleTimeout();
}


(function () {
  $(document).on('click', '.interval', function (event) {
    const info = $(event.target).closest('.interval').data('info');
    showInterval(info);
  });

  $('.extra-image').on('click', function (event) {
    event.kill();
    target = $(this);
    if (target.data('image')) {
      showIntervalImage(target.data('image'), target);
    }
    return false;
  })
}());

$('#events li').on('click', function () {
  var item = $(this);

  if (item.hasClass('selected')) {
    return;
  }

  item.parent().find('li.selected').removeClass('selected');
  item.addClass('selected');
});

$('#hide-interval').on('click', function () {
  hideInterval();
});

var hammertime = new Hammer($('#timeline-interval').get(0), {
  threshold: 30,
  direction: Hammer.DIRECTION_HORIZONTAL
});

hammertime.on('swipe', function(ev) {
  const currentInterval = $('#timeline-interval').data('info');
  var nextIndex;
  if (ev.deltaX < 0) {
    nextIndex = intervals.indexOf(currentInterval) + 1;
  } else {
    nextIndex = intervals.indexOf(currentInterval) - 1;
  }

  if (nextIndex >= 0 && nextIndex < intervals.length) {
    showInterval(intervals[nextIndex]);
  }
});

// swap cta
$(function () {
  var cta = $('#call-to-action');

  function swapper() {
    cta.toggleClass('swapped');
    setTimeout(swapper, 5000);
  };

  swapper();
}());

// keep overview from sticking
$(function () {
  var timeline = $('#timeline-overview');

  function tweak() {
    if (!scrolling) {
      var left = timeline.data('left');
      left += (Math.random() - 0.5) * 0.1;
      timeline.css({
        transform: `translate(${left}px, 0px)`
      });
    }

    setTimeout(tweak, 30);
  }

  tweak();
}());

