function WalkontableHorizontalScrollbarNative(instance) {
  this.instance = instance;
  this.type = 'horizontal';
  this.cellSize = 50;
  this.offset = 0;
  this.init();
  this.clone = this.makeClone('left');
}

WalkontableHorizontalScrollbarNative.prototype = new WalkontableOverlay();

//resetFixedPosition (in future merge it with this.refresh?)
WalkontableHorizontalScrollbarNative.prototype.resetFixedPosition = function () {
  if (!this.instance.wtTable.holder.parentNode) {
    return; //removed from DOM
  }
  var elem = this.clone.wtTable.holder.parentNode;

	if (this.scrollHandler === window) {
    var box = this.instance.wtTable.holder.getBoundingClientRect();
    var left = Math.ceil(box.left);

    if (left < 0) {
      elem.style.left = -left + 'px';
    } else {
      elem.style.left = '0';
    }

    elem.style.top = this.instance.wtTable.hider.style.top;
  }
  else {
    elem.style.top = this.instance.wtTable.hider.style.top;
    elem.style.left = this.windowScrollPosition + "px";
  }

  elem.style.height = Handsontable.Dom.outerHeight(this.clone.wtTable.TABLE) + 'px';
  elem.style.width = Handsontable.Dom.outerWidth(this.clone.wtTable.TABLE) + 4 + 'px';
};

WalkontableHorizontalScrollbarNative.prototype.refresh = function (selectionsOnly) {
  WalkontableOverlay.prototype.refresh.call(this, selectionsOnly);
};

WalkontableHorizontalScrollbarNative.prototype.getScrollPosition = function () {
  return Handsontable.Dom.getScrollLeft(this.scrollHandler);
};

WalkontableHorizontalScrollbarNative.prototype.setScrollPosition = function (pos) {
  if (this.scrollHandler === window){
    window.scrollTo(pos, Handsontable.Dom.getWindowScrollTop());
  } else {
    this.scrollHandler.scrollLeft = pos;
  }
};

WalkontableHorizontalScrollbarNative.prototype.onScroll = function () {
  WalkontableOverlay.prototype.onScroll.call(this);

  this.instance.getSetting('onScrollHorizontally');
};

WalkontableHorizontalScrollbarNative.prototype.getLastCell = function () {
  return this.instance.wtTable.getLastVisibleColumn();
};

//applyToDOM (in future merge it with this.refresh?)
WalkontableHorizontalScrollbarNative.prototype.applyToDOM = function () {
  this.readWindowSize();
};

WalkontableHorizontalScrollbarNative.prototype.scrollTo = function (cell) {
  this.setScrollPosition(this.tableParentOffset + cell * this.cellSize);
};

WalkontableHorizontalScrollbarNative.prototype.readWindowSize = function () {
  if (this.scrollHandler === window) {
    this.windowSize = document.documentElement.clientWidth;
    this.tableParentOffset = this.instance.wtTable.holderOffset.left;
  }
  else {
    this.windowSize = this.scrollHandler.clientWidth;
    this.tableParentOffset = 0;
  }
  this.windowScrollPosition = this.getScrollPosition();
};

WalkontableHorizontalScrollbarNative.prototype.readSettings = function () {
  this.readWindowSize();
  this.total = this.instance.getSetting('totalColumns');
};