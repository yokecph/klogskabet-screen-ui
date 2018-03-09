// This file loads some common bits of JS
// See required files for details

require('./fullscreen.js');

module.exports = {
  jQuery: require('./jquery-extended.js'),
  locale: require('./locales.js'),
  loadingOverlay: require('./loading-overlay.js'),
  colors: require('./colors.js'),
  config: require('./config.js'),
  content: require('./content.js')
};
