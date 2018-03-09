// a very simple loading overlay; only works once per page load

const $ = require('./jquery-extended.js');

class LoadingOverlay {
  constructor() {
    this.element = $('#loading-overlay');
    this.label = this.element.find('span');
    this.progressBarOuter = this.element.find('#progress-bar-container');
    this.progressBarInner = this.element.find('#progress-bar-fill');
    this._total = 1;
    this._completed = 0;
  }

  set total(total) {
    this._total = total;
  }

  get total() {
    return this._total;
  }

  get completed() {
    return this._completed;
  }

  get finished() {
    return this._completed >= this._total;
  }

  tick() {
    this._completed++;
    this.update(this._completed, this._total);
  }

  add() {
    this.element.show();
  }

  update(loaded, total) {
    this.progressBarInner.css({
      width: `${Math.min(100, 100 * loaded / total)}%`
    });
  }

  remove() {
    this.element.remove();
  }

  error(msg) {
    this.label.text(msg);
    this.progressBarOuter.hide();
  }
}

module.exports = new LoadingOverlay();
