// A gallery item is an image. It's placed in a column that's, in turn, placed
// on the canvas.

const $ = require('common/common.js').jQuery;
const k = require('gallery/constants.js');

class GalleryItem {

  // create an item from a JSON obj containing its title, url, etc..
  // the callback is invoked when the image has loaded
  constructor(info, callback) {
    this.info = info;
    this.angle = 90;
    this.targetAngle = 90;
    this.list = null;
    this.element = $('<div></div>')
      .addClass('image')
      .data('item', this);

    this.img = new Image();
    this.img.onload = _ => {
      this.width = k.listWidth;
      this.height = k.listWidth * (this.img.height / this.img.width);

      this.element.css({
        width: `${this.width}px`,
        height: `${this.height}px`,
        'background-image': `url(${this.img.src})`
      });

      if (typeof callback === 'function') {
        callback.call(this);
      }
    };

    this.img.onerror = err => {
      if (typeof callback === 'function') {
        callback.call(this, err);
      }
    };

    this.img.src = info.url;

    this.setPosition(0, 0);
    this.setRotation(90);
  }

  // set the item's position within its list (i.e. its top offset)
  setPosition(left, top) {
    this.left = 0; // intentionally zeroed
    this.top = top;
    this.element.css({ top: `${this.top}px` });
  }

  // prepare the item for its reveal animation, if necessary
  setReveal(forceOffscreen) {
    if (!this.isInView || forceOffscreen) {
      this.targetAngle = 90;
      this.setRotation(this.targetAngle);
    } else {
      this.targetAngle = 0;
    }
  }

  // update the reveal animation (rotation)
  updateReveal() {
    if (this.angle > this.targetAngle) {
      this.setRotation(Math.max(0, this.angle - 20));
      return true;
    }

    if (this.angle !== this.targetAngle) {
      this.setRotation(this.targetAngle);
    }

    return false;
  }

  // this function resets the lists left-offset to remain in the same place on
  // screen when the canvas's translation is reset
  optimize() {
    this.setPosition(0, this.top + this.list.canvas.top);
  }

  // set the item's CSS rotation
  setRotation(angle) {
    this.angle = angle;
    this.element.css({ transform: `rotateY(${this.angle}deg)` });
  }

  // the pixel offset (from top) of the item's lower edge in local space
  get bottom() {
    return this.top + this.height;
  }

  // the item's offset from the top of the screen
  get screenTop() {
    return this.top + this.list.canvas.top;
  }

  // the item's lower edge offset from the top of the screen
  get screenBottom() {
    return this.screenTop + this.height;
  }

  // the item's offset from the left side of the screen
  get screenLeft() {
    return this.list.screenLeft;
  }

  // the item's righthand edge offset from the left side of the screen
  get screenRight() {
    return this.list.screenRight;
  }

  // Whether the item is currently intersecting the screen rect
  get isInView() {
    return this.screenLeft < k.screenWidth
        && this.screenRight > 0
        && this.screenTop < k.screenHeight
        && this.screenBottom > 0;
  }
}

module.exports = GalleryItem;
