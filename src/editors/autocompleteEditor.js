(function (Handsontable) {
  var AutocompleteEditor = Handsontable.editors.TextEditor.prototype.extend();

  AutocompleteEditor.prototype.init = function () {
    Handsontable.editors.TextEditor.prototype.init.apply(this, arguments);
    this.emptyStringLabel = '\u00A0\u00A0\u00A0'; //3 non-breaking spaces
  };

  AutocompleteEditor.prototype.createElements = function(){

    Handsontable.editors.TextEditor.prototype.createElements.apply(this, arguments);

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

  AutocompleteEditor.prototype.bindEvents = function () {
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

      this.typeahead.$menu.on('mouseleave', function(){
        that.typeahead.$menu.find('.active').removeClass('active');
      });


    Handsontable.editors.TextEditor.prototype.bindEvents.apply(this, arguments);
  };

  AutocompleteEditor.prototype.prepare = function (td, row, col, prop, value, cellProperties) {
    var that = this
      , i
      , j;

    Handsontable.editors.TextEditor.prototype.prepare.apply(this, arguments);

    this.typeahead._valueSelected = false;

    this.typeahead.select = function () {
      var active = this.$menu[0].querySelector('.active');
      var val = active.getAttribute('data-value');
      if (val === that.emptyStringLabel) {
        val = '';
      }
      if (typeof that.cellProperties.onSelect === 'function') {
        that.cellProperties.onSelect(that.row, that.col, that.prop, val, that.instance.view.wt.wtDom.index(active));
      }
      else {
        that.TEXTAREA.value = val;
      }

      this._valueSelected = true;

      this.hide(); //need to hide it before destroyEditor, because destroyEditor checks if menu is expanded
      that.finishEditing();

      return this;
    };

    this.typeahead.render = function (items) {
      that.typeahead._render.call(this, items);
      if (!that.cellProperties.strict) {
        var li = this.$menu[0].querySelector('.active');
        if (li) {
          that.instance.view.wt.wtDom.removeClass(li, 'active')
        }
      }
      return this;
    };

    /* overwrite typeahead options and methods (matcher, sorter, highlighter, updater, etc) if provided in cellProperties */
    for (i in this.cellProperties) {
      // if (cellProperties.hasOwnProperty(i)) {
      if (i === 'options') {
        for (j in this.cellProperties.options) {
          // if (cellProperties.options.hasOwnProperty(j)) {
          this.typeahead.options[j] = this.cellProperties.options[j];
          // }
        }
      }
      else {
        this.typeahead[i] = this.cellProperties[i];
      }
      // }
    }

    var _cellMouseDown = that.instance.view.wt.wtSettings.settings['onCellMouseDown'];

    function onCellMouseDown(){
      that.instance.destroyEditor();
      that.beginEditing();
      that.instance.registerTimeout('IE9_align_fix', function () { //otherwise is misaligned in IE9
        that.typeahead.lookup();
      }, 1);

      _cellMouseDown.apply(this, arguments);
    }

    this.instance.view.wt.update('onCellMouseDown', onCellMouseDown);

    function onDblClick() {
      that.beginEditing();
      that.instance.registerTimeout('IE9_align_fix', function () { //otherwise is misaligned in IE9
        that.typeahead.lookup();
      }, 1);
    }

    this.instance.view.wt.update('onCellDblClick', onDblClick);
  };

  AutocompleteEditor.prototype.finishEditing = function (isCancelled, ctrlDown) {
    if (!isCancelled) {
      if (this.isMenuExpanded()) {
        if(this.typeahead.$menu[0].querySelector('.active')){
          this.typeahead.select();
          this.state = this.STATE_FINISHED;
        } else if (this.cellProperties.strict) {
          this.state = this.STATE_FINISHED;
        }
      }
    }

    return Handsontable.editors.TextEditor.prototype.finishEditing.apply(this, arguments);
  };

  AutocompleteEditor.prototype.isMenuExpanded = function () {
    if (this.instance.view.wt.wtDom.isVisible(this.typeahead.$menu[0])) {
      return this.typeahead;
    }
    else {
      return false;
    }
  };

  Handsontable.editors.AutocompleteEditor = AutocompleteEditor;
  Handsontable.editors.registerEditor('autocomplete', AutocompleteEditor);

})(Handsontable);


