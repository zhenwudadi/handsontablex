function WalkontableSettings(instance, settings) {
  var that = this;
  this.instance = instance;

  //default settings. void 0 means it is required, null means it can be empty
  this.defaults = {
    table: void 0,

    //presentation mode
    async: false,
    scrollH: 'auto', //values: scroll (always show scrollbar), auto (show scrollbar if table does not fit in the container), none (never show scrollbar)
    scrollV: 'auto', //values: see above
    stretchH: 'hybrid', //values: hybrid, all, last, none
    currentRowClassName: null,
    currentColumnClassName: null,

    //data source
    data: void 0,
    offsetRow: 0,
    offsetColumn: 0,
    rowHeaders: null, //this must be a function in format: function (row, TH) {}
    columnHeaders: null, //this must be a function in format: function (col, TH) {}
    totalRows: void 0,
    totalColumns: void 0,
    width: null,
    height: null,
    cellRenderer: function (row, column, TD) {
      var cellData = that.getSetting('data', row, column);
      that.instance.wtDom.avoidInnerHTML(TD, cellData === void 0 || cellData === null ? '' : cellData);
    },
    columnWidth: 50,
    selections: null,

    //callbacks
    onCellMouseDown: null,
    onCellMouseOver: null,
    onCellDblClick: null,
    onCellCornerMouseDown: null,
    onCellCornerDblClick: null,
    onDraw: null,

    //constants
    scrollbarWidth: 10,
    scrollbarHeight: 10,
    rowHeaderWidth: 50
  };

  //reference to settings
  this.settings = {};
  for (var i in this.defaults) {
    if (this.defaults.hasOwnProperty(i)) {
      if (settings[i] !== void 0) {
        this.settings[i] = settings[i];
      }
      else if (this.defaults[i] === void 0) {
        throw new Error('A required setting "' + i + '" was not provided');
      }
      else {
        this.settings[i] = this.defaults[i];
      }
    }
  }

  this.rowHeightCache = [];
}

/**
 * generic methods
 */

WalkontableSettings.prototype.update = function (settings, value) {
  if (value === void 0) { //settings is object
    for (var i in settings) {
      if (settings.hasOwnProperty(i)) {
        this.settings[i] = settings[i];
      }
    }
  }
  else { //if value is defined then settings is the key
    this.settings[settings] = value;
  }
  return this.instance;
};

WalkontableSettings.prototype.getSetting = function (key, param1, param2, param3) {
  if (this[key]) {
    return this[key](param1, param2, param3);
  }
  else {
    return this._getSetting(key, param1, param2, param3);
  }
};

WalkontableSettings.prototype._getSetting = function (key, param1, param2, param3) {
  if (typeof this.settings[key] === 'function') {
    return this.settings[key](param1, param2, param3);
  }
  else if (param1 !== void 0 && Object.prototype.toString.call(this.settings[key]) === '[object Array]' && param1 !== void 0) {
    return this.settings[key][param1];
  }
  else {
    return this.settings[key];
  }
};

WalkontableSettings.prototype.has = function (key) {
  return !!this.settings[key]
};

/**
 * specific methods
 */

WalkontableSettings.prototype.rowHeight = function (row) {
  if (typeof this.rowHeightCache[row] !== 'undefined') {
    return this.rowHeightCache[row];
  }
  return 20;
};

WalkontableSettings.prototype.columnWidth = function (column) {
  return Math.min(200, this._getSetting('columnWidth', column));
};