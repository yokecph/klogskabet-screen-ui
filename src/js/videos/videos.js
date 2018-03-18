const common = require('common/common.js');
const $ = common.jQuery;
const loader = common.loadingOverlay;
const Player = require('videos/VideoPlayer.js');

const IDLE_TIMEOUT = 60000; // 1 minute

var singleVideo = false;
var idleTimer = null;

// load content on page load (we wait the document to have loaded and the
// YouTube API to be ready)
$(window).on('load', function () {
  YT.ready(function () {
    common.content.load(function (json) {
      if (json.videos.length !== 4) {
        json = json.videos.slice(-1);
      } else {
        json = json.videos;
      }

      singleVideo = (json.length === 1);

      loader.total = json.length;

      // create a thumbnail + player for each given video
      json.forEach(function (obj) {
        const player = new Player(obj, function () {
          // set up event handlers
          player.onpause = function () {
            $('#video-overlay').removeClass('transparent');
            $('#play-button').show();
            startIdleTimer();
          };

          player.onplaying = function () {
            const overlay = $('#video-overlay');
            overlay.addClass('transparent');
            overlay.find('#play-button').show();
            overlay.find('#poster-overlay').hide();
            clearIdleTimer();
          };

          player.onended = function () {
            const overlay = $('#video-overlay');
            overlay.removeClass('transparent');
            overlay.find('#play-button').show();
            overlay.find('#poster-overlay').show();
            player.stop();
            startIdleTimer();
          };

          player.onseeking = function () {
            $('#play-button').hide();
            clearIdleTimer();
          };

          player.onseeked = function () {
            $('#play-button').show();
          };

          loader.tick();

          if (loader.finished) {
            loader.remove();

            if (singleVideo) {
              showVideo(player);
            }
          }
        });

        $('#gallery').append(player.thumbnailElement);
      });
    });
  });

});

function showVideo(player) {
  const overlay = $('#video-overlay');
  const description = overlay.find('#description');

  // set the player type
  if (player.youtube) {
    overlay.addClass('youtube');
  } else {
    overlay.removeClass('youtube');
    overlay.find('#poster-overlay').css({
      'background-image': `url(${player.posterUrl || '/images/blank.gif'})`
    });
  }

  // populate description etc.
  description.find('h1')
    .setLocalizedText(player.info, 'title');

  description.find('h2')
    .setLocalizedText(player.info, 'subtitle');

  description.find('#description-body')
    .setLocalizedText(player.info, 'description_html', true);

  // show video and play
  player.containerElement.show();
  $('#videos').show();

  overlay
    .toggleClass('single-video', singleVideo)
    .removeClass('transparent')
    .data('player', player);

  if (!singleVideo) {
    player.play();
  }
}

function hideVideo() {
  if (singleVideo) {
    return;
  }

  const overlay = $('#video-overlay');
  const player = overlay.data('player');
  player.containerElement.hide();
  $('#videos').hide();
  player.stop();
}

function startIdleTimer() {
  clearIdleTimer();
  idleTimer = setTimeout(goIdle, IDLE_TIMEOUT);
}

function clearIdleTimer() {
  clearTimeout(idleTimer);
}

function goIdle() {
  const overlay = $('#video-overlay');
  const player = overlay.data('player');

  if (player) {
    if (!player.paused) {
      return;
    }

    player.stop();
    overlay.find('#poster-overlay').show();
  }

  if (!singleVideo) {
    hideVideo();
  } else {
    player.rewind();
  }

  $('#description-container').hide();
}

// show and play the selected video when a thumbnail's play button is clicked
$(document).on('click', '.thumbnail', function (event) {
  const player = $(this).closest('.thumbnail').data('player');
  showVideo(player);
});

// play/pause when the full screen video overlay is clicked
$('#video-overlay').on('click', function (event) {
  const overlay = $('#video-overlay');
  const player = overlay.data('player');

  if (player.paused) {
    $('#description-container').hide();
    player.play();
  } else {
    player.pause();
  }

  return event.kill();
});

// kill events on the description overlay
$('#description-container').on('click', function (event) {
  startIdleTimer();
  return event.kill();
});

// show description etc. when the info button is clicked
$('#info-button').on('click', function (event) {
  const overlay = $('#video-overlay');
  const player = overlay.data('player');
  player.pause();
  $('#description-container').show();
  startIdleTimer();
  return event.kill();
});

// hide description etc. when the close button is clicked
$('#close-button').on('click', function (event) {
  $('#description-container').hide();
  return event.kill();
});

// hide video completely when the info button is clicked
$('#stop-button').on('click', function (event) {
  hideVideo();
  return event.kill();
});
