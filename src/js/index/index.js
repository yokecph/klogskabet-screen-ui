const common = require('common/common.js');

function showDeviceId() {
  $('#device-id').text(common.config.deviceId ? common.config.deviceId : '<not set>');
}

showDeviceId();

$('#set-device-id').on('click', function (event) {
  var newId;

  event.preventDefault();

  if (common.config.deviceId) {
    newId = prompt("Change device ID", common.config.deviceId);
  } else {
    newId = prompt("Set the device ID (nothing's currently set)");
  }

  if (newId && /^[a-z0-9_-]+$/i.test(newId)) {
    common.config.deviceId = newId;
    alert(`Device ID changed to "${newId}"`);
  } else {
    alert('Invalid ID (ID is blank or contains illegal characters)');
  }

  showDeviceId();

  return false;
});

$('#set-passcode').on('click', function (event) {
  event.preventDefault();

  const currentPasscode = prompt('Enter current passcode');

  if (currentPasscode !== common.config.passcode) {
    alert('Invalid passcode');
    return;
  }

  const newPasscode = prompt('Enter new passcode', currentPasscode);

  if (newPasscode && /^\d{4}$/.test(newPasscode)) {
    common.config.passcode = newPasscode;
    alert('Passcode changed');
  } else {
    alert('Invalid code (code is blank or contains illegal characters)');
  }

  showDeviceId();

  return false;
});

$(document).on('unlocked', function () {
  console.log('UNLOCKED');

  $('#settings').show();
});

if (location.hash === '#no-fullscreen') {
  $('#settings').show();
} else {

  common.content.load(function (json) {

    if (['video_gallery', 'gallery', 'timeline', 'quiz'].indexOf(json.kind) !== -1) {
      location.href = `${json.kind}.html`;
    } else {
      $('#status').text(`Invalid content type: "${json.content_type}"`);
    }

  }, function (msg) {
    $('#status').text(msg);
  });

}
