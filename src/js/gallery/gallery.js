// Main gallery script

// Idle timings
const IDLE_TIMEOUT = 60000; // 60 sec
const IDLING_INTERVAL = 20000; // 10 sec

// Load dependencies
const common = require('common/common.js');
const $ = common.jQuery;
const loader = common.loadingOverlay;
const GalleryCanvas = require('gallery/GalleryCanvas.js');
const GalleryItem = require('gallery/GalleryItem.js');

// Create a canvas
const canvas = new GalleryCanvas($('#canvas'));

// Load content
common.content.load(function (json) {
  var remaining = json.images.length || 0;
  loader.total = remaining;

  // Add images
  json.images.forEach(function (obj, i) {
    var item = new GalleryItem(obj, function (err) {
      loader.tick();

      if (!err) {
        canvas.add(item);
      }

      if (--remaining === 0) {
        loader.remove();
        canvas.rearrange();
        animateReveal();
        idle();
      }
    });
  });
});

// add some custom scrolling behavior for the gallery.
// Either the iDisplay or the Android OS (not just Firefox) seems to limit
// regular, built-in scrolling to 350-400px, no matter how far you drag your
// fingers. So the following is necessary to achieve nicer scrolling behavior
$(document).on('touchstart mousedown', function (e) {
  startIdleTimeout();

  // don't scroll things if we're already viewing an image
  if ($('#modal:visible').length) {
    return;
  }

  const touch = /mouse/.test(e.type) ? e.originalEvent : e.originalEvent.touches.item(0);
  const sx = touch.clientX;
  const sy = touch.clientY;
  const offsetX = canvas.left || 0;
  const offsetY = canvas.top || 0;

  function scroll(e) {
    // get the scrolling delta
    const touch = /mouse/.test(e.type) ? e.originalEvent : e.originalEvent.touches.item(0);
    const deltaX = touch.clientX - sx;
    const deltaY = touch.clientY - sy;

    // get the new scroll offset, clamped to the timeline's size
    const left = offsetX + deltaX;
    const top = offsetY + deltaY;

    canvas.setPosition(left, top);
  }

  // add a move handler
  $(document).on('touchmove mousemove', scroll);

  // remove the move handler once the touch ends
  $(document).one('touchend mouseup', function (e) {
    canvas.rotateLists();
    animateReveal();
    startIdleTimeout();
    $(document).off('touchmove mousemove', scroll);
  });
});

var idleTimeout = null;
var idlingInterval = null;

// start countdown to idle
function startIdleTimeout() {
  clearIdleTimeouts();
  idleTimeout = setTimeout(idle, IDLE_TIMEOUT);
}

// clear idle timeouts
function clearIdleTimeouts() {
  $('#call-to-action').hide();
  clearTimeout(idleTimeout);
  clearTimeout(idlingInterval);
}

// this function is called periodically when the device is idling
// It just randomly picks an image to center on
function idle() {
  canvas.optimize();
  clearIdleTimeouts();
  hideImageModal();
  $('#call-to-action').show();
  centerItem(canvas.getRandomItem());
  idlingInterval = setTimeout(idle, IDLING_INTERVAL);
}

// Update reveal (image turn) animations
function animateReveal() {
  var anyUpdated = canvas.updateReveal();
  if (anyUpdated) {
    requestAnimationFrame(animateReveal);
  }
}

// "Center" a given gallery item (that is, move the canvas, so the image is
// centered on the left side where its closeup would be shown)
function centerItem(item) {
  var centerLeft = item.screenLeft + item.width / 2;
  var centerTop = item.screenTop + item.height / 2;

  var offsetLeft = (screen.width - $('#description-container').outerWidth()) / 2;
  var offsetTop = screen.height / 2;

  var deltaLeft = offsetLeft - centerLeft;
  var deltaTop = offsetTop - centerTop;

  canvas.setPosition(canvas.left + deltaLeft, canvas.top + deltaTop);
  canvas.rotateLists();
  animateReveal();
}

// Show a the closeup and descriptipn of a given gallery item
function showImageModal(item) {
  var modal = $('#modal');

  // center the selected image
  centerItem(item);

  // populate description etc.
  modal.find('#source').setLocalizedText(item.info, 'source');
  modal.find('h1').setLocalizedText(item.info, 'title');
  modal.find('#description-body').setLocalizedText(item.info, 'description_html', true);
  modal.find('#closeup').css({
    'background-image': `url(${item.info.url})`
  });
  modal.show();
}

// Hide closeup and description
function hideImageModal() {
  $('#overlay').hide();
  $('#modal').hide();
}

// Hide the description etc. if the overlay is clicked
$('#modal').on('click', function (event) {
  startIdleTimeout();
  if (event.target === this) {
    hideImageModal();
    return event.kill();
  }
});

// Hide the description etc. if the close button is clicked
$('#close-modal').on('click', function (event) {
  hideImageModal();
  startIdleTimeout();
  return event.kill();
});

// Show the description etc. if an image is clicked
$(document).on('click', '.image', function () {
  const item = $(this).data('item');
  showImageModal(item);
  startIdleTimeout();
});
