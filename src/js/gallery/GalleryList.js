// A gallery list/column holds an arbitrary number of items (images).

const $ = require('common/common.js').jQuery;
const k = require('gallery/constants.js');

class GalleryList {

  // create a list belonging to the given canvas, with the given left offset
  constructor(canvas, leftOffset) {
    this.canvas = canvas;
    this.items = [];
    this.element = $('<div></div>').addClass('image-list');
    this.setPosition(leftOffset, 0);
  }

  // set the list's CSS translation
  setPosition(left, top) {
    this.left = left;
    this.top = 0; // intentionally zeroed
    this.element.css('transform', `translate(${this.left}px, ${this.top}px)`);
  }

  // add an item to the top of the list
  prepend(item) {
    var prev = this.items[0];
    var top = prev ? prev.top - item.height - k.listMargin : 0;

    this.element.append(item.element); // this must be called first

    item.setPosition(0, top);
    item.list = this;

    this.items.unshift(item);
  }

  // add an item to the bottom of the list
  append(item) {
    var prev = this.items[this.items.length - 1];
    var top = prev ? prev.bottom + k.listMargin : 0;

    this.element.append(item.element);

    item.setPosition(0, top);
    item.list = this;

    this.items.push(item);
  }

  // move items from the top to the bottom or vice versa to keep items on-screen
  rotateItems() {
    if (this.items.length < 2) {
      return;
    }

    while (this.items[0].screenTop > k.listMargin) {
      let item = this.items.pop(); // grab from bottom
      this.prepend(item);
      item.setReveal(true);
    }

    while (this.items[this.items.length - 1].screenBottom < k.screenHeight - k.listMargin) {
      let item = this.items.shift(); // grab from top
      this.append(item);
      item.setReveal(true);
    }

    this.setReveal(false);
  }

  // call setReveal() on each item in the list
  setReveal(forceOffscreen) {
    this.items.forEach(item => item.setReveal(forceOffscreen));
  }

  // call updateReveal() on each item in the list
  updateReveal() {
    return this.items.reduce((bool, item) =>
      bool || item.updateReveal()
    , false);
  }

  // this function resets the items top-offset to remain in the same place on
  // screen when the canvas's and the list's translations are reset
  optimize() {
    this.items.forEach(item => item.optimize());
    this.setPosition(this.left + this.canvas.left, 0);
  }

  // get a random item from the list
  getRandomItem() {
    return this.items[this.items.length * Math.random() | 0];
  }

  // get the list's left offset in screen space
  get screenLeft() {
    return this.left + this.canvas.left;
  }

  // get the list's righhand side offset in screen space
  get screenRight() {
    return this.screenLeft + k.listWidth;
  }

  // get the list's height (cumulative height of items + margins)
  get height() {
    return this.items.reduce((sum, item) => sum += item.height + k.listMargin, 0);
  }
}

module.exports = GalleryList;
