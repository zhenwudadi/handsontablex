function HandsontableAutocompleteEditorClass(instance) {
  this.instance = instance;
  this.createElements();
  this.bindEvents();
  this.emptyStringLabel = '\u00A0\u00A0\u00A0'; //3 non-breaking spaces
}

Handsontable.helper.inherit(HandsontableAutocompleteEditorClass, HandsontableTextEditorClass);

/**
 * @see HandsontableTextEditorClass.prototype.createElements
 */
HandsontableAutocompleteEditorClass.prototype.createElements = function () {
  HandsontableTextEditorClass.prototype.createElements.call(this);

  this.$textarea.typeahead();
  this.typeahead = this.$textarea.data('typeahead');
  this.typeahead._render = this.typeahead.render;
  this.typeahead.minLength = 0;

  this.typeahead.lookup = function () {
    var items;
    this.query = this.$element.val();
    items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this)) : this.source;
    return items ? this.process(items) : this;
  };

  this.typeahead.matcher = function () {
    return true;
  };

  var _process = this.typeahead.process;
  var that = this;
  this.typeahead.process = function (items) {
    var cloned = false;
    for (var i = 0, ilen = items.length; i < ilen; i++) {
      if (items[i] === '') {
        //this is needed because because of issue #254
        //empty string ('') is a falsy value and breaks the loop in bootstrap-typeahead.js method `sorter`
        //best solution would be to change line: `while (item = items.shift()) {`
        //                                   to: `while ((item = items.shift()) !== void 0) {`
        if (!cloned) {
          //need to clone items before applying emptyStringLabel
          //(otherwise validateChanges fails for empty string)
          items = $.extend([], items);
          cloned = true;
        }
        items[i] = that.emptyStringLabel;
      }
    }
    return _process.call(this, items);
  };
};

/**
 * @see HandsontableTextEditorClass.prototype.bindEvents
 */
HandsontableAutocompleteEditorClass.prototype.bindEvents = function () {
  var that = this;

  this.$textarea.off('keydown').off('keyup').off('keypress'); //unlisten

  this.$textarea.off('.acEditor').on('keydown.acEditor', function (event) {
    switch (event.keyCode) {
      case 38: /* arrow up */
        that.typeahead.prev();
        event.stopImmediatePropagation(); //stops TextEditor and core onKeyDown handler
        break;

      case 40: /* arrow down */
        that.typeahead.next();
        event.stopImmediatePropagation(); //stops TextEditor and core onKeyDown handler
        break;

      case 13: /* enter */
        event.preventDefault();
        break;
    }
  });

  this.$textarea.on('keyup.acEditor', function (event) {
    if (Handsontable.helper.isPrintableChar(event.keyCode) || event.keyCode === 113 || event.keyCode === 13 || event.keyCode === 8 || event.keyCode === 46) {
      that.typeahead.lookup();
    }
  });


  HandsontableTextEditorClass.prototype.bindEvents.call(this);
};
/**
 * @see HandsontableTextEditorClass.prototype.bindTemporaryEvents
 */
HandsontableAutocompleteEditorClass.prototype.bindTemporaryEvents = function (td, row, col, prop, value, cellProperties) {
  var that = this
    , i
    , j;

  this.typeahead.select = function () {
    var output = this.hide(); //need to hide it before destroyEditor, because destroyEditor checks if menu is expanded
    that.instance.destroyEditor(true);
    var active = this.$menu[0].querySelector('.active');
    var val = $(active).attr('data-value');
    if (val === that.emptyStringLabel) {
      val = '';
    }
    if (typeof cellProperties.onSelect === 'function') {
      cellProperties.onSelect(row, col, prop, val, that.instance.view.wt.wtDom.index(active));
    }
    else {
      that.instance.setDataAtRowProp(row, prop, val);
    }
    return output;
  };

  this.typeahead.render = function (items) {
    that.typeahead._render.call(this, items);
    if (!cellProperties.strict) {
      var li = this.$menu[0].querySelector('.active');
      if (li) {
        that.instance.view.wt.wtDom.removeClass(li, 'active')
      }
    }
    return this;
  };

  /* overwrite typeahead options and methods (matcher, sorter, highlighter, updater, etc) if provided in cellProperties */
  for (i in cellProperties) {
    // if (cellProperties.hasOwnProperty(i)) {
    if (i === 'options') {
      for (j in cellProperties.options) {
        // if (cellProperties.options.hasOwnProperty(j)) {
        this.typeahead.options[j] = cellProperties.options[j];
        // }
      }
    }
    else {
      this.typeahead[i] = cellProperties[i];
    }
    // }
  }

  HandsontableTextEditorClass.prototype.bindTemporaryEvents.call(this, td, row, col, prop, value, cellProperties);

  function onDblClick() {
    that.beginEditing(row, col, prop, true);
    that.instance.registerTimeout('IE9_align_fix', function () { //otherwise is misaligned in IE9
      that.typeahead.lookup();
    }, 1);
  }

  this.instance.view.wt.update('onCellDblClick', onDblClick);
};
/**
 * @see HandsontableTextEditorClass.prototype.finishEditing
 */
HandsontableAutocompleteEditorClass.prototype.finishEditing = function (isCancelled, ctrlDown) {
  if (!isCancelled) {
    if (this.isMenuExpanded() && this.typeahead.$menu[0].querySelector('.active')) {
      this.typeahead.select();
      this.state = this.STATE_FINISHED; //cell value was updated by this.typeahead.select (issue #405)
    }
    else if (this.cellProperties.strict) {
      this.state = this.STATE_FINISHED; //cell value was not picked from this.typeahead.select (issue #405)
    }
  }

  HandsontableTextEditorClass.prototype.finishEditing.call(this, isCancelled, ctrlDown);
};

HandsontableAutocompleteEditorClass.prototype.isMenuExpanded = function () {
  if (this.instance.view.wt.wtDom.isVisible(this.typeahead.$menu[0])) {
    return this.typeahead;
  }
  else {
    return false;
  }
};

/**
 * Autocomplete editor
 * @param {Object} instance Handsontable instance
 * @param {Element} td Table cell where to render
 * @param {Number} row
 * @param {Number} col
 * @param {String|Number} prop Row object property name
 * @param value Original value (remember to escape unsafe HTML before inserting to DOM!)
 * @param {Object} cellProperties Cell properites (shared by cell renderer and editor)
 */
Handsontable.AutocompleteEditor = function (instance, td, row, col, prop, value, cellProperties) {
  if (!instance.autocompleteEditor) {
    instance.autocompleteEditor = new HandsontableAutocompleteEditorClass(instance);
  }
  instance.autocompleteEditor.bindTemporaryEvents(td, row, col, prop, value, cellProperties);
  return function (isCancelled) {
    instance.autocompleteEditor.finishEditing(isCancelled);
  }
};