// The gallery canvas is the main "layout" of images
// It consists of 4 of more columns (GalleryList instances) each with an
// arbitrary number of images

const $ = require('common/common.js').jQuery;
const k = require('gallery/constants.js');
const GalleryList = require('gallery/GalleryList.js');

class GalleryCanvas {

  // Create a canvas using the given element
  constructor(element) {
    this.element = $(element);
    this.setPosition(0, 0);

    this.lists = [];
    for(var i = 0 ; i < k.listCount ; i++) {
      let list = new GalleryList(this, i * (k.listWidth + k.listMargin));
      this.lists.push(list);
      this.element.append(list.element);
    }
  }

  // Add a GalleryItem. The function will place the item into the
  // currently-smallest list to distribute them roughly evenly
  add(item) {
    const smallestList = this.lists.reduce(function (a, b) {
      return a.height < b.height ? a : b;
    });

    smallestList.append(item);
    item.setReveal();
  }

  // Rearrange the default 4 columns into more columns, if possible.
  // If the 4 initial columns are more than twice as tall as it is wide,
  // add a column, and move some images to it
  rearrange() {
    const columnsPopulated = this.lists.reduce((bool, list, i) => {
      return bool && list.height > k.screenHeight;
    }, true);

    if (!columnsPopulated) {
      return;
    }

    var size = this.minSize; // width x smallest column height
    if (size.height / size.width > 2) {
      let newList = new GalleryList(this, this.lists.length * (k.listWidth + k.listMargin));
      this.element.append(newList.element);
      var tallest = this.tallestList;
      while (tallest.height > newList.height) {
        var item = tallest.items.pop();
        newList.append(item);
        tallest = this.tallestList;
      }
      this.lists.push(newList);
    }
  }

  // transform the canvas element (i.e. scroll it)
  setPosition(left, top) {
    this.left = left;
    this.top = top;
    this.element.css({ transform: `translate(${this.left}px, ${this.top}px)` });
  }

  // move lists from right to left or left to right as needed to fill the screen
  rotateLists() {
    this.lists.forEach(list => list.rotateItems());

    while (this.lists[0].screenLeft > k.listMargin) {
      let list = this.lists.pop(); // take right-most list
      list.setPosition(this.lists[0].left - k.listWidth - k.listMargin, 0);
      list.setReveal(true);
      this.lists.unshift(list);
    }

    while (this.lists[this.lists.length - 1].screenRight < k.screenWidth - k.listMargin) {
      let list = this.lists.shift(); // take left-most list
      list.setPosition(this.lists[this.lists.length - 1].left + k.listWidth + k.listMargin, 0);
      list.setReveal(true);
      this.lists.push(list);
    }

    this.lists.forEach(list => list.setReveal(false));
  }

  // update reveal animations
  updateReveal() {
    return this.lists.reduce((bool, list) =>
      bool || list.updateReveal()
    , false);
  }

  // this function resets the canvas's translation while keeping the lists
  // visually in the same place, to avoid the translation values growing
  // indefinitely
  optimize() {
    this.lists.forEach(list => list.optimize());
    this.setPosition(0, 0);
  }

  // get a random gallery item from a random list
  getRandomItem() {
    return this.lists[this.lists.length * Math.random() | 0].getRandomItem();
  }

  // get the smallest (height-wise) list
  get smallestList() {
    return this.lists.reduce(function (a, b) {
      return a.height < b.height ? a : b;
    });
  }

  // get the tallest list
  get tallestList() {
    return this.lists.reduce(function (a, b) {
      return a.height > b.height ? a : b;
    });
  }

  // get width/height of the layout (height is taken as height of the smallest
  // list)
  get minSize() {
    const width = this.lists.length * k.listWidth + (this.lists.length - 1) * k.listMargin;
    const height = this.smallestList.height;
    return { width, height };
  }
}

module.exports = GalleryCanvas;
