function parseDatacolumn(HANDSONTABLE, HOTCOLUMN) {
  var obj = {}
    , attrName
    , i
    , ilen
    , val;

  for (i = 0, ilen = publicProperties.length; i < ilen; i++) {
    attrName = publicProperties[i];
    if (attrName === 'data') {
      attrName = 'value';
    }

    if (HOTCOLUMN[attrName] !== void 0 && HOTCOLUMN[attrName] !== "" && HOTCOLUMN[attrName] !== null) { //Dec 3, 2013 - Polymer returns empty string for node properties such as HOTCOLUMN.width
      val = HOTCOLUMN[attrName];
    }
    else {
      val = HOTCOLUMN.getAttribute(attrName);
    }

    if (val !== void 0 && val !== HANDSONTABLE[attrName]) {
      obj[publicProperties[i]] = readOption(HOTCOLUMN, attrName, val);
    }
  }

  if ((obj.type === 'autocomplete' || obj.type === 'dropdown') && typeof HOTCOLUMN.getAttribute('source') === 'string') {
    obj.source = window[HOTCOLUMN.getAttribute('source')];
  }

  if (typeof HOTCOLUMN.getAttribute('renderer') === 'string') {
    obj.renderer = getModelPath(HOTCOLUMN.parentNode, HOTCOLUMN.getAttribute('renderer'))
  }

  var inner_HANDSONTABLE = HOTCOLUMN.getElementsByTagName('handsontable-table');
  if (inner_HANDSONTABLE.length) {
    obj.handsontable = parseHandsontable(inner_HANDSONTABLE[0]);
  }

  return obj;
}

function getModel(HANDSONTABLE) {
  if (HANDSONTABLE.templateInstance) {
    return HANDSONTABLE.templateInstance.model;
  }
  else {
    return window;
  }
}

function getModelPath(HANDSONTABLE, path) {
  if (typeof path === 'object' || typeof path === 'function') { //happens in Polymer when assigning as datarows="{{ model.subpage.people }}" or settings="{{ model.subpage.settings }}
    return path;
  }
  var model = getModel(HANDSONTABLE);
  var expression = 'with(model) { ' + path + ';}';
  var obj = eval(expression);
  return (obj);
}

function parseDatacolumns(HANDSONTABLE) {
  var columns = []
    , i
    , ilen;

  for (i = 0, ilen = HANDSONTABLE.childNodes.length; i < ilen; i++) {
    if (HANDSONTABLE.childNodes[i].nodeName === 'HANDSONTABLE-COLUMN') {
      columns.push(parseDatacolumn(HANDSONTABLE, HANDSONTABLE.childNodes[i]));
    }
  }

  return columns;
}

function readOption(HANDSONTABLE, key, value) {
  if (key === 'datarows') {
    return getModelPath(HANDSONTABLE, value);
  }
  else if (key === 'renderer') {
    return getModelPath(HANDSONTABLE, value);
  }
  else if (key === 'afterOnCellMouseOver') {
    return getModelPath(HANDSONTABLE, value);
  }
  else if (publicHooks.indexOf(key) > -1) {
    return getModelPath(HANDSONTABLE, value);
  }
  else {
    return readBool(value);
  }
}

function parseHandsontable(HANDSONTABLE) {
  var columns = parseDatacolumns(HANDSONTABLE);
  var options = webComponentDefaults();
  var attrName, i, ilen;

  for (i = 0, ilen = publicProperties.length; i < ilen; i++) {
    attrName = publicProperties[i];
    if (attrName === 'data') {
      attrName = 'datarows';
    }
    options[publicProperties[i]] = readOption(HANDSONTABLE, attrName, HANDSONTABLE[attrName]);
  }

  if (HANDSONTABLE.settings) {
    var settingsAttr = getModelPath(HANDSONTABLE, HANDSONTABLE.settings);
    for (i in settingsAttr) {
      if (settingsAttr.hasOwnProperty(i)) {
        options[i] = settingsAttr[i];
      }
    }
  }

  if (columns.length) {
    options.columns = columns;
  }

  return options;
}

var publicMethods = ['updateSettings', 'loadData', 'render', 'setDataAtCell', 'setDataAtRowProp', 'getDataAtCell', 'getDataAtRowProp', 'countRows', 'countCols', 'rowOffset', 'colOffset', 'countVisibleRows', 'countVisibleCols', 'clear', 'clearUndo', 'getData', 'alter', 'getCell', 'getCellMeta', 'selectCell', 'deselectCell', 'getSelected', 'destroyEditor', 'getRowHeader', 'getColHeader', 'destroy', 'isUndoAvailable', 'isRedoAvailable', 'undo', 'redo', 'countEmptyRows', 'countEmptyCols', /*'isEmptyRow', 'isEmptyCol', -- those are also publicProperties*/ 'parseSettingsFromDOM', 'addHook', 'addHookOnce', 'getValue', 'getInstance', 'getSettings'];
var publicHooks = Object.keys(Handsontable.PluginHooks.hooks);
var publicProperties = Object.keys(Handsontable.DefaultSettings.prototype);
publicProperties.push('settings', 'title', 'checkedTemplate', 'uncheckedTemplate'); //properties not mentioned in DefaultSettings

publicProperties = publicProperties.concat(publicHooks);

function webComponentDefaults() {
  return {
    observeChanges: true
  }
}

var wcDefaults = webComponentDefaults();

var publish = {
};

publicMethods.forEach(function (hot_method) {
  publish[hot_method] = function () {
    return this.instance[hot_method].apply(this.instance, arguments);
  }
});

publicProperties.forEach(function (hot_prop) {
  if (!publish[hot_prop]) {
    var wc_prop = hot_prop;

    if (hot_prop === 'data') {
      wc_prop = 'datarows';
    }

    var val = wcDefaults[hot_prop] === void 0 ? Handsontable.DefaultSettings.prototype[hot_prop] : wcDefaults[hot_prop];

    if (val === void 0) {
      publish[wc_prop] = null; //Polymer does not like undefined
    }
    else if (hot_prop === 'observeChanges') {
      publish[wc_prop] = true; //on by default
    }
    else {
      publish[wc_prop] = val;
    }

    publish[wc_prop + 'Changed'] = function () {
      if (!this.instance) {
        return; //attribute changed callback called before enteredView
      }

      if (wc_prop === 'settings') {
        var settings = getModelPath(this, this[wc_prop]);
        this.updateSettings(settings);
        return;
      }

      var update = {};
      update[hot_prop] = readOption(this, wc_prop, this[wc_prop]);
      this.updateSettings(update);
    }
  }
});

function readBool(val) {
  if (val === void 0 || val === "false") {
    return false;
  }
  else if (val === "" || val === "true") {
    return true;
  }
  return val;
}

Polymer('handsontable-table', {
  instance: null,
  enteredView: function () {
    this.shadowRoot.applyAuthorStyles = true; //only way I know to let override Shadow DOM styles (just define ".handsontable td" in page stylesheet)
    jQuery(this.$.htContainer).handsontable(parseHandsontable(this));
    this.instance = jQuery(this.$.htContainer).data('handsontable');
  },
  onMutation: function () {
    if (this === window) {
      //it is a bug in Polymer or Chrome as of Nov 29, 2013
      return;
    }
    var columns = parseDatacolumns(this);
    if (columns.length) {
      this.updateSettings({columns: columns});
    }
  },
  publish: publish
});