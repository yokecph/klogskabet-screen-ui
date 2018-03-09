// This file handles swapping the UI language

const $ = require('./jquery-extended.js');

// The current locale (either 'da' or 'en'; default value is set below)
window.currentLocale = null;

// A simple class for handling locale swapping
class Localization {
  constructor() {}

  set enabled(bool) {
    if (bool) {
      $('.set-locale').show();
    } else {
      $('.set-locale').hide();
    }
  }

  // Set the locale (either 'da' or 'en')
  set locale(locale) {
    if (locale === currentLocale || !/^(da|en)$/.test(locale)) {
      return;
    }

    // find elements with localized text and change their content
    $(`[data-${locale}]`).each(function () {
      var $element = $(this);
      if ($element.attr('data-html') === 'true') {
        $element.html($element.attr(`data-${locale}`));
      } else {
        $element.text($element.attr(`data-${locale}`));
      }
    });

    window.currentLocale = locale;

    // set the active locale's button to selected
    $('.set-locale.selected').removeClass('selected');
    $(`.set-locale[data-locale=${window.currentLocale}]`).addClass('selected');
  }

  // Get the current locale
  get locale() {
    return window.currentLocale;
  }
}

const instance = new Localization();
module.exports = instance;

// add click handlers for the common language-switch buttons
$('.set-locale').on('click', function (event) {
  instance.locale = $(this).data('locale');
  return event.kill();
});

// default to Danish on load
instance.locale = 'da';
