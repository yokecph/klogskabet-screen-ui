const $ = require('./jquery-extended.js');
const queryString = require('query-string');
const config = require('./config.js');
const colors = require('./colors.js');
const locales = require('./locales.js');

function load(onsuccess, onerror) {

  const query = queryString.parse(location.search);

  onsuccess = typeof onsuccess === 'function' ? onsuccess : (msg => console.log(msg));
  onerror = typeof onerror === 'function' ? onerror : (msg => console.error(msg));

  var url;

  if (query.content) {
    url = query.content;
  } else {
    if (!config.deviceId) {
      onerror('No device ID set. Unlock to configure.');
      return;
    } else {
      url = `/api/devices/${config.deviceId}.json`;
    }
  }


  $.ajax({
    dataType: "json",

    cache: false,

    url: url,

    headers: {
      'X-Device-Type': 'screen'
    },

    success: function (json, status, xhr) {
      if (json.theme_color) {
        colors.setThemeColor(json.theme_color);
      }

      locales.enabled = (json.bilingual === true);

      onsuccess(json);
    },

    error: function (xhr, error, status) {
      onerror(`An error occurred: "${String(error)}" (${status || 'N/A'})`);
    }
  });
}

module.exports = { load };
