(function (Handsontable) {
  var AutocompleteEditor = Handsontable.editors.HandsontableEditor.prototype.extend();

  AutocompleteEditor.prototype.init = function () {
    Handsontable.editors.HandsontableEditor.prototype.init.apply(this, arguments);

    this.query = null;
    this.choices = [];
  };

  AutocompleteEditor.prototype.createElements = function(){
    Handsontable.editors.HandsontableEditor.prototype.createElements.apply(this, arguments);

    var getSystemSpecificPaddingClass = function () {
      if(window.navigator.platform.indexOf('Mac') != -1) {
        return "htMacScroll";
      } else {
        return "";
      }
    };

    this.$htContainer.addClass('autocompleteEditor');
    this.$htContainer.addClass(getSystemSpecificPaddingClass());

  };

  var skipOne = false;
  var onBeforeKeyDown = function (event) {
    skipOne = false;
    var editor = this.getActiveEditor();
    var keyCodes = Handsontable.helper.keyCode;

    if (Handsontable.helper.isPrintableChar(event.keyCode) || event.keyCode === keyCodes.BACKSPACE || event.keyCode === keyCodes.DELETE  || event.keyCode === keyCodes.INSERT) {
      editor.instance._registerTimeout(setTimeout(function () {
        editor.queryChoices(editor.TEXTAREA.value);
        skipOne = true;
      }, 0));
    }
  };

  AutocompleteEditor.prototype.prepare = function () {
    this.instance.addHook('beforeKeyDown', onBeforeKeyDown);
    Handsontable.editors.HandsontableEditor.prototype.prepare.apply(this, arguments);
  };

  AutocompleteEditor.prototype.open = function () {
    Handsontable.editors.HandsontableEditor.prototype.open.apply(this, arguments);

    this.TEXTAREA.style.visibility = 'visible';
    this.focus();

    var choicesListHot = this.$htContainer.handsontable('getInstance');
    var that = this;

    choicesListHot.updateSettings({
      'colWidths': [Handsontable.Dom.outerWidth(this.TEXTAREA) - 2],
      afterRenderer: function (TD, row, col, prop, value) {
        var caseSensitive = this.getCellMeta(row, col).filteringCaseSensitive === true;
        var indexOfMatch =  caseSensitive ? value.indexOf(this.query) : value.toLowerCase().indexOf(that.query.toLowerCase());

        if(indexOfMatch != -1){
          var match = value.substr(indexOfMatch, that.query.length);
          TD.innerHTML = value.replace(match, '<strong>' + match + '</strong>');
        }
      }
    });

    if(skipOne) {
      skipOne = false;
    }
    that.instance._registerTimeout(setTimeout(function () {
      that.queryChoices(that.TEXTAREA.value);
    }, 0));

  };

  AutocompleteEditor.prototype.close = function () {
    Handsontable.editors.HandsontableEditor.prototype.close.apply(this, arguments);
  };

  AutocompleteEditor.prototype.queryChoices = function(query){
    this.query = query;

    if (typeof this.cellProperties.source == 'function'){
      var that = this;

      this.cellProperties.source(query, function(choices){
        that.updateChoicesList(choices);
      });

    } else if (Handsontable.helper.isArray(this.cellProperties.source)) {

      var choices;

      if(!query || this.cellProperties.filter === false){
        choices = this.cellProperties.source;
      } else {

        var filteringCaseSensitive = this.cellProperties.filteringCaseSensitive === true;
        var lowerCaseQuery = query.toLowerCase();

        choices = this.cellProperties.source.filter(function(choice){

          if (filteringCaseSensitive) {
            return choice.indexOf(query) != -1;
          } else {
            return choice.toLowerCase().indexOf(lowerCaseQuery) != -1;
          }

        });
      }

      this.updateChoicesList(choices);

    } else {
      this.updateChoicesList([]);
    }

  };

  AutocompleteEditor.prototype.updateChoicesList = function (choices) {
    var pos = Handsontable.Dom.getCaretPosition(this.TEXTAREA),
        endPos = Handsontable.Dom.getSelectionEndPosition(this.TEXTAREA);

    var sortedByRelevance = AutocompleteEditor.sortByRelevance(this.getValue(), choices, this.cellProperties.filteringCaseSensitive);
    if (this.cellProperties.filter != false) {
      choices = sortedByRelevance;
    }

    this.choices = choices;

    this.$htContainer.handsontable('loadData', Handsontable.helper.pivot([choices]));
    this.$htContainer.handsontable('updateSettings', {height: this.getDropdownHeight()});

    if (this.cellProperties.strict === true) {
      this.highlightBestMatchingChoice(sortedByRelevance);
    }

    this.instance.listen();
    this.TEXTAREA.focus();
    Handsontable.Dom.setCaretPosition(this.TEXTAREA, pos, (pos != endPos ? endPos : void 0));
  };

  AutocompleteEditor.prototype.finishEditing = function (restoreOriginalValue) {
    if (!restoreOriginalValue) {
      this.instance.removeHook('beforeKeyDown', onBeforeKeyDown);
    }
    Handsontable.editors.HandsontableEditor.prototype.finishEditing.apply(this, arguments);
  };

  AutocompleteEditor.prototype.highlightBestMatchingChoice = function (matchedChoices) {
    if (matchedChoices.length === 0) {
      this.$htContainer.handsontable('deselectCell');
    } else {
      if (this.cellProperties.filter === false) {
        this.$htContainer.handsontable('selectCell', this.bestMatchingChoiceIndex, 0);
      } else {
        this.$htContainer.handsontable('selectCell', 0, 0);
      }
    }
  };

  AutocompleteEditor.sortByRelevance = function(value, choices, caseSensitive) {

    var choicesRelevance = []
      , currentItem
      , valueLength = value.length
      , valueIndex
      , charsLeft
      , result = [];

    if(valueLength === 0) {
      return choices;
    }

    for(var i = 0, choicesCount = choices.length; i < choicesCount; i++) {
      currentItem = choices[i];

      if(caseSensitive) {
        valueIndex = currentItem.indexOf(value);
      } else {
        valueIndex = currentItem.toLowerCase().indexOf(value.toLowerCase());
      }


      if(valueIndex == -1) { continue; }
      charsLeft =  currentItem.length - valueIndex - valueLength;

      choicesRelevance.push({
        baseIndex: i,
        index: valueIndex,
        charsLeft: charsLeft,
        value: currentItem
      });
    }

    choicesRelevance.sort(function(a, b) {

      if(b.index === -1) return -1;
      if(a.index === -1) return 1;

      if(a.index < b.index) {
        return -1;
      } else if(b.index < a.index) {
        return 1;
      } else if(a.index === b.index) {
        if(a.charsLeft < b.charsLeft) {
          return -1;
        } else if(a.charsLeft > b.charsLeft) {
          return 1;
        } else {
          return 0;
        }
      }
    });

    // set best maching choice base index
    this.bestMatchingChoiceIndex = choicesRelevance.length > 0 ? choicesRelevance[0].baseIndex : void 0;

    for(var i = 0, choicesCount = choicesRelevance.length; i < choicesCount; i++) {
      result.push(choicesRelevance[i].value);
    }

    return result;
  };

  AutocompleteEditor.prototype.getDropdownHeight = function(){
    var firstRowHeight = this.$htContainer.handsontable('getInstance').getRowHeight(0) || 23;
    return this.choices.length >= 10 ? 10 * firstRowHeight : this.choices.length * firstRowHeight + 8;
    //return 10 * this.$htContainer.handsontable('getInstance').getRowHeight(0);
    //sorry, we can't measure row height before it was rendered. Let's use fixed height for now
    return 230;
  };


  Handsontable.editors.AutocompleteEditor = AutocompleteEditor;
  Handsontable.editors.registerEditor('autocomplete', AutocompleteEditor);

})(Handsontable);
