function WalkontableSelection(settings, cellRange) {
  this.settings = settings;
  this.cellRange = cellRange || null;
  this.instanceBorders = {};
}

/**
 * Each Walkontable clone requires it's own border for every selection. This method creates and returns selection borders per instance
 * @param {Walkontable} instance
 * @returns {WalkontableBorder}
 */
WalkontableSelection.prototype.getBorder = function (instance) {
  if (this.instanceBorders[instance.guid]) {
    return this.instanceBorders[instance.guid];
  }
  //where is this returned?
  this.instanceBorders[instance.guid] = new WalkontableBorder(instance, this.settings);
};

/**
 * Returns boolean information if selection is empty
 * @returns {boolean}
 */
WalkontableSelection.prototype.isEmpty = function () {
  return this.cellRange === null;
};

/**
 * Adds a cell coords to the selection
 * @param {WalkontableCellCoords} coords
 */
WalkontableSelection.prototype.add = function (coords) {
  if (this.isEmpty()) {
    this.cellRange = new WalkontableCellRange(coords, coords, coords);
  }
  else {
    this.cellRange.expand(coords);
  }
};

/**
 * If selection range from or to property equals oldCoords, replace it with newCoords. Return boolean information about success
 * @param {WalkontableCellCoords} oldCoords
 * @param {WalkontableCellCoords} newCoords
 * @return {boolean}
 */
WalkontableSelection.prototype.replace = function (oldCoords, newCoords) {
  if (this.isEmpty()) {
    return false;
  }
  if (this.cellRange.from.isEqual(oldCoords)) {
    this.cellRange.from = newCoords;
  }
  if (this.cellRange.to.isEqual(oldCoords)) {
    this.cellRange.to = newCoords;
  }

  return true;
};

WalkontableSelection.prototype.clear = function () {
  this.cellRange = null;
};

/**
 * Returns the top left (TL) and bottom right (BR) selection coordinates
 * @returns {Object}
 */
WalkontableSelection.prototype.getCorners = function () {
  var
    topLeft = this.cellRange.getTopLeftCorner(),
    bottomRight = this.cellRange.getBottomRightCorner();

  return [topLeft.row, topLeft.col, bottomRight.row, bottomRight.col];
};

WalkontableSelection.prototype.addClassAtCoords = function (instance, sourceRow, sourceColumn, cls) {
  var TD = instance.wtTable.getCell(new WalkontableCellCoords(sourceRow, sourceColumn));

  if (typeof TD === 'object') {
    Handsontable.Dom.addClass(TD, cls);
  }
};

WalkontableSelection.prototype.draw = function (instance) {
  var
    _this = this,
    visibleRows = instance.wtTable.getRenderedRowsCount(),
    renderedColumns = instance.wtTable.getRenderedColumnsCount(),
    drawVerticalOverlay,
    drawHorizontalOverlay,
    draw,
    corners, sourceRow, sourceCol, border, TH;

  if (this.isEmpty()) {
    if (this.settings.border) {
      border = this.getBorder(instance);

      if (border) {
        border.disappear();
      }
    }

    return;
  }
  drawVerticalOverlay = function drawVerticalOverlay() {
    for (var column = 0; column < renderedColumns; column++) {
      sourceCol = instance.wtTable.columnFilter.renderedToSource(column);

      if (sourceCol >= corners[1] && sourceCol <= corners[3]) {
        TH = instance.wtTable.getColumnHeader(sourceCol);

        if (TH && _this.settings.highlightColumnClassName) {
          Handsontable.Dom.addClass(TH, _this.settings.highlightColumnClassName);
        }
      }
    }
  };
  drawHorizontalOverlay = function drawHorizontalOverlay() {
    for (var row = 0; row < visibleRows; row++) {
      sourceRow = instance.wtTable.rowFilter.renderedToSource(row);

      if (sourceRow >= corners[0] && sourceRow <= corners[2]) {
        TH = instance.wtTable.getRowHeader(sourceRow);

        if (TH && _this.settings.highlightRowClassName) {
          Handsontable.Dom.addClass(TH, _this.settings.highlightRowClassName);
        }
      }
    }
  };
  draw = function draw() {
    for (var row = 0; row < visibleRows; row++) {
      sourceRow = instance.wtTable.rowFilter.renderedToSource(row);

      for (var column = 0; column < renderedColumns; column++) {
        sourceCol = instance.wtTable.columnFilter.renderedToSource(column);

        if (sourceRow >= corners[0] && sourceRow <= corners[2] && sourceCol >= corners[1] && sourceCol <= corners[3]) {
          // selected cell
          if (_this.settings.className) {
            _this.addClassAtCoords(instance, sourceRow, sourceCol, _this.settings.className);
          }
          // selected row headers
          if (sourceCol === corners[1]) {
            TH = instance.wtTable.getRowHeader(sourceRow);

            if (TH && _this.settings.highlightRowClassName) {
              Handsontable.Dom.addClass(TH, _this.settings.highlightRowClassName);
            }
          }
          // selected column headers
          if (sourceRow === corners[0] || (sourceRow > corners[0] && row == 0)) {
            TH = instance.wtTable.getColumnHeader(sourceCol);

            if (TH && _this.settings.highlightColumnClassName) {
              Handsontable.Dom.addClass(TH, _this.settings.highlightColumnClassName);
            }
          }
        }
        else if (sourceRow >= corners[0] && sourceRow <= corners[2]) {
          // selection is in this row
          if (_this.settings.highlightRowClassName) {
            _this.addClassAtCoords(instance, sourceRow, sourceCol, _this.settings.highlightRowClassName);
          }
        }
        else if (sourceCol >= corners[1] && sourceCol <= corners[3]) {
          // selection is in this column
          if (_this.settings.highlightColumnClassName) {
            _this.addClassAtCoords(instance, sourceRow, sourceCol, _this.settings.highlightColumnClassName);
          }
        }
      }
    }
  };
  corners = this.getCorners();

  if (instance.cloneOverlay instanceof WalkontableHorizontalScrollbarNative) {
    drawHorizontalOverlay();
  } else if (instance.cloneOverlay instanceof WalkontableVerticalScrollbarNative) {
    drawVerticalOverlay();
  } else {
    draw();
  }
  instance.getSetting('onBeforeDrawBorders', corners, this.settings.className);

  if (this.settings.border) {
    border = this.getBorder(instance);

    if (border) {
      // warning! border.appear modifies corners!
      border.appear(corners);
    }
  }
};
