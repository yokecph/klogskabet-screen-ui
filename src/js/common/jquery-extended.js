// This file loads jQuery and adds some extra features

const $ = require('jquery');

// jQuery plugin to set the localized text of an element
// Takes an object holding strings in different languages, and a key prefix
// string. E.g. .setLocalizedText({ foo_da: "", foo_en: ""}, "foo") will set
// the element's text to whichever of the foo_* strings that match the currently
// set language. The element will also have the strings assigned to it as
// data-* attributes, so the language can be switched later using the
// setLocale() function
$.fn.setLocalizedText = function (obj, prefix, html) {
  const attrs = ['da', 'en'].reduce((attrs, locale) => {
    attrs[`data-${locale}`] = obj[`${prefix}_${locale}`];
    return attrs;
  }, {});

  attrs['data-html'] = html ? 'true' : 'false';

  const text = attrs[`data-${window.currentLocale}`];

  this.attr(attrs);

  if (html) {
    this.html(text);
  } else {
    this.text(text);
  }

  return this;
};


// Simple addition to jQuery's Event constructor, which just flat-out kills
// the event: No bubbling, no default behavior, no other event handlers called
$.Event.prototype.kill = function () {
  this.stopPropagation();
  this.stopImmediatePropagation();
  this.preventDefault();
  return false;
};

// export jquery again, with extensions, and add it to the global scope
// for use from the dev console
module.exports = $;
window.$ = window.jQuery = $;
