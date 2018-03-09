const $ = require('./jquery-extended.js');

const colors = [
  '#fffbbd', // yellow
  '#bce6bc', // green
  '#b7d7ed', // blue
  '#dac2ff', // purple
  '#ffddff', // pink
  '#ffd7b3', // orange
  '#cfd0d0'  // gray
];

window.cycleColor = function () {
  const color = colors.shift();

  $('.theme-color-background').css({
    background: color
  });

  $('.theme-color-text').css({
    color: color
  });

  colors.push(color);
};

module.exports = {
  setThemeColor: function (color) {
    const css = `.theme-color-background { background: ${color}; } .theme-color-text { color: ${color}; }`
    $('<style></style>').text(css).appendTo(document.body);
  }
};
