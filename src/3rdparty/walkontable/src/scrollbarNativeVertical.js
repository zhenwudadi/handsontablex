function WalkontableVerticalScrollbarNative(instance) {
  this.instance = instance;
  this.type = 'vertical';
  this.cellSize = this.instance.wtSettings.settings.defaultRowHeight;
  this.offset;
  this.total;
  this.init();
  this.clone = this.makeClone('top');
}

WalkontableVerticalScrollbarNative.prototype = new WalkontableOverlay();

//resetFixedPosition (in future merge it with this.refresh?)
WalkontableVerticalScrollbarNative.prototype.resetFixedPosition = function () {
  if (!this.instance.wtTable.holder.parentNode) {
    return; //removed from DOM
  }
  var elem = this.clone.wtTable.holder.parentNode;

  if (this.scrollHandler === window) {
    var box = this.instance.wtTable.holder.getBoundingClientRect();
    var top = Math.ceil(box.top);

    elem.style.left = '0';

    if (top < 0) {
      elem.style.top = -top + "px";
    } else {
      elem.style.top = "0";
    }
  }
  else {
    elem.style.top = this.windowScrollPosition + "px";
    elem.style.left = '0';
  }

  if (this.instance.wtScrollbars.horizontal.scrollHandler === window) {
    elem.style.width = this.instance.wtViewport.getWorkspaceActualWidth() + 'px';
  }
  else {
    elem.style.width = Handsontable.Dom.outerWidth(this.clone.wtTable.TABLE) + 'px';
  }

  elem.style.height = Handsontable.Dom.outerHeight(this.clone.wtTable.TABLE) + 4 + 'px';
};

WalkontableVerticalScrollbarNative.prototype.getScrollPosition = function () {
  return Handsontable.Dom.getScrollTop(this.scrollHandler);
};

WalkontableVerticalScrollbarNative.prototype.setScrollPosition = function (pos) {
  if (this.scrollHandler === window){
    window.scrollTo(Handsontable.Dom.getWindowScrollLeft(), pos);
  } else {
    this.scrollHandler.scrollTop = pos;
  }
};

WalkontableVerticalScrollbarNative.prototype.onScroll = function () {
  WalkontableOverlay.prototype.onScroll.call(this);

  this.instance.draw(true);//

  this.instance.getSetting('onScrollVertically');
};

WalkontableVerticalScrollbarNative.prototype.getLastCell = function () {
  return this.instance.getSetting('offsetRow') + this.instance.wtTable.tbodyChildrenLength - 1;
};

WalkontableVerticalScrollbarNative.prototype.sumCellSizes = function (from, length) {
  var sum = 0;
  while (from < length) {
    sum += this.instance.wtSettings.settings.rowHeight(from) || this.instance.wtSettings.settings.defaultRowHeight; //TODO optimize getSetting, because this is MUCH faster then getSetting
    from++;
  }
  return sum;
};

WalkontableVerticalScrollbarNative.prototype.refresh = function (selectionsOnly) {
  this.applyToDOM();
  WalkontableOverlay.prototype.refresh.call(this, selectionsOnly);
};

//applyToDOM (in future merge it with this.refresh?)
WalkontableVerticalScrollbarNative.prototype.applyToDOM = function () {
  var last = this.getLastCell();
  this.measureBefore = this.sumCellSizes(0, this.offset);
  if (last === -1) { //last -1 means that viewport is scrolled behind the table
    this.measureAfter = 0;
  }
  else {
    this.measureAfter = this.sumCellSizes(last, this.total - last);
  }
  var headerSize = this.instance.wtViewport.getColumnHeaderHeight();
  this.fixedContainer.style.height = headerSize + this.sumCellSizes(0, this.total) + 4 + 'px'; //+4 is needed, otherwise vertical scroll appears in Chrome (window scroll mode) - maybe because of fill handle in last row or because of box shadow
  this.fixed.style.top = this.measureBefore + 'px';
  this.fixed.style.bottom = '';
};

WalkontableVerticalScrollbarNative.prototype.scrollTo = function (cell) {
  var newY = this.tableParentOffset + cell * this.cellSize;
  this.setScrollPosition(newY);
  this.onScroll();
};

WalkontableVerticalScrollbarNative.prototype.readWindowSize = function () {
  if (this.scrollHandler === window) {
    this.windowSize = document.documentElement.clientHeight;
    this.tableParentOffset = this.instance.wtTable.holderOffset.top;
  }
  else {
    var elemHeight = Handsontable.Dom.outerHeight(this.scrollHandler);
    this.windowSize = elemHeight > 0 && this.scrollHandler.clientHeight > 0 ? this.scrollHandler.clientHeight : Infinity; //returns height without DIV scrollbar
    this.tableParentOffset = 0;
  }
  this.windowScrollPosition = this.getScrollPosition();
};

WalkontableVerticalScrollbarNative.prototype.readSettings = function () {
  this.readWindowSize();

  this.offset = this.instance.getSetting('offsetRow');
  this.total = this.instance.getSetting('totalRows');

  var scrollDelta = this.windowScrollPosition - this.tableParentOffset;

  var sum = 0;
  var last;
  for (var i = 0; i < this.total; i++) {
    last = this.instance.getSetting('rowHeight', i) || this.instance.wtSettings.settings.defaultRowHeight;
    sum += last;
    if (sum - 1 > scrollDelta) {
      break;
    }
  }

  this.offset = Math.min(i, this.total);
  this.instance.update('offsetRow', this.offset);
};