const $ = require('./jquery-extended.js');
const config = require('./config.js');

// don't enter fullscreen if the URL hash says no-fullscreen
if (location.hash !== '#no-fullscreen') {
  // set a small timeout to avoid a graphics bug in Firefox where the UI hangs around anyway
  setTimeout(enter, 2000);
}

// NOTE: This code relies on Firefox for Android having been configured to allow
// fullscreen without user interaction! It will not work in regular browsers,
// where that behavior is prohibited.
function enter() {
  const element = document.querySelector('#wrapper');
  try {
    // smooth over browser differences
    (element.requestFullscreen || element.mozRequestFullscreen || element.webkitRequestFullscreen).call(element);
  } catch(e) {}
}

function exit() {
  // polyfill
  document.exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen;

  document.exitFullscreen();
}

function showKeypad() {
  var enteredPin = '';

  const keypadField = $('<div></div>')
    .attr('id', 'keypad-field')
    .css({ 'text-align': 'center', 'color': 'white', 'font-size': '3em', 'height': '1em'});

  const keypadOverlay = $('<div></div>')
    .attr('id', 'keypad-overlay')
    .on('click', function (event) {
      remove();
      return event.kill();
    })
    .appendTo('#wrapper');

  const keypad = $('<div></div>')
    .attr('id', 'keypad')
    .appendTo(keypadOverlay);

  function remove() {
    clearTimeout(timeout);
    keypadOverlay.remove();
  }

  keypad.append(keypadField);

  for (var i = 0 ; i < 10 ; i++) {
    let digit = (i + 1) % 10;
    $('<button></button>')
      .text(digit)
      .on('click', function (event) {
        keypadField.text(keypadField.text() + "*");
        enteredPin += String(digit);
        if (enteredPin.length === 4) {
          console.log(enteredPin, config.passcode);
          if (enteredPin === config.passcode) {
            exit();

            $(document).trigger('unlocked');
            console.log('Unlocked');

            location.href = "index.html#no-fullscreen";
          }
          remove();
        }
        return event.kill();
      })
      .appendTo(keypad);
  }

  const timeout = setTimeout(function () {
    remove();
  }, 20000);
}

// Add "secret" gesture for exiting fullscreen
// The gesture is to touch and hold all four corners of the screen beginning
// each touch in a specifc order:
//
// 1. top left
// 2. bottom left
// 3. top right
// 4. bottom right
//
// Once triggered, a keypad will show up, and a 4-digit PIN is required.
// That PIN is set in the device settings (default is "0000")
(function () {
  var timer = null;

  $(document).on('touchstart', function (event) {

    function hit(touch, x, y, width, height) {
      if (touch.clientX > x && touch.clientX < x + width) {
        if (touch.clientY > y && touch.clientY < y + height ) {
          return true;
        }
      }
      return false;
    }

    var touches = event.originalEvent.touches;
    if (touches.length === 4) {
      if (
          hit(touches[0], 0, 0, 200, 200) &&
          hit(touches[1], 0, screen.height - 200, 200, 200) &&
          hit(touches[2], screen.width - 200, 0, 200, 200) &&
          hit(touches[3], screen.width - 200, screen.height - 200, 200, 200)
        ) {
          console.log('Got magic touch!');
          timer = setTimeout(function () {
            showKeypad();
          }, 10);
        }
    }
  });

  $(document).on('touchend', function () {
    clearTimeout(timer);
  });
}());

// test/dev function to simulate touches
window.testTouch = function (selector) {
  var element = document.querySelector(selector);
  var event = document.createEvent('event');
  event.initEvent('touchstart', true, true);
  event.touches = [
    {
      clientX: 100,
      clientY: 100
    },
    {
      clientX: 100,
      clientY: screen.height - 100
    },
    {
      clientX: screen.width - 100,
      clientY: 100
    },
    {
      clientX: screen.width - 100,
      clientY: screen.height - 100
    }
  ];
  element.dispatchEvent(event);
};

module.exports = {
  showKeypad,
  enter,
  exit
};
