(function (Handsontable) {
  /**
   * Plugin used to allow user to copy and paste from the context menu
   * Currently uses ZeroClipboard due to browser limitations
   * @constructor
   */
  function ContextMenuCopyPaste() {
    this.zeroClipboardInstance = null;
    this.instance = null;
  }

  /**
   * Configure ZeroClipboard
   */
  ContextMenuCopyPaste.prototype.prepareZeroClipboard = function () {
    ZeroClipboard.config({
      swfPath: this.swfPath
    });
  };

  /**
   * Copy action
   * @returns {CopyPasteClass.elTextarea.value|*}
   */
  ContextMenuCopyPaste.prototype.copy = function () {
    this.instance.copyPaste.setCopyableText();
    return this.instance.copyPaste.copyPasteInstance.elTextarea.value;
  };

  /**
   * Adds copy/paste items to context menu
   */
  ContextMenuCopyPaste.prototype.addToContextMenu = function (defaultOptions) {
    if (!this.getSettings().contextMenuCopyPaste) {
      return;
    }

    defaultOptions.items.unshift(
      {
        key: 'copy',
        name: 'Copy'
      },
      {
        key: 'paste',
        name: 'Paste',
        callback: function () {
          this.copyPaste.triggerPaste();
        }
      },
      Handsontable.ContextMenu.SEPARATOR
    );
  };

  /**
   * Setup ZeroClipboard swf clip position and event handlers
   * @param cmInstance Current context menu instance
   */
  ContextMenuCopyPaste.prototype.setupZeroClipboard = function (cmInstance) {
    var plugin = this;
    this.cmInstance = cmInstance;

    if (!Handsontable.Dom.hasClass(this.cmInstance.rootElement[0], 'htContextMenu')) {
      return;
    }

    var data = cmInstance.getData();
    for (var i = 0, ilen = data.length; i < ilen; i++) { //find position of 'copy' option
      if (data[i].key === 'copy') {
        this.zeroClipboardInstance = new ZeroClipboard(cmInstance.getCell(i, 0));

        this.zeroClipboardInstance.off();
        this.zeroClipboardInstance.on("copy", function (event) {
          var clipboard = event.clipboardData;
          clipboard.setData("text/plain", plugin.copy());
          plugin.instance.getSettings().outsideClickDeselects = plugin.outsideClickDeselectsCache;
        });

        cmCopyPaste.bindEvents();
        break;
      }
    }
  };

  /**
   * Bind all the standard events
   */
  ContextMenuCopyPaste.prototype.bindEvents = function () {
    var plugin = this;

    // Workaround for 'current' and 'zeroclipboard-is-hover' classes being stuck when moving the cursor over the context menu
    if (plugin.cmInstance) {
      $(document).off('mouseenter.' + plugin.cmInstance.guid).on('mouseenter.' + plugin.cmInstance.guid, '#global-zeroclipboard-flash-bridge', function (event) {
        var hadClass = plugin.cmInstance.rootElement[0].querySelector('td.current');
        if (hadClass) {
          Handsontable.Dom.removeClass(hadClass, 'current');
        }
        plugin.outsideClickDeselectsCache = plugin.instance.getSettings().outsideClickDeselects;
        plugin.instance.getSettings().outsideClickDeselects = false;
      });

      $(document).off('mouseleave.' + plugin.cmInstance.guid).on('mouseleave.' + plugin.cmInstance.guid, '#global-zeroclipboard-flash-bridge', function (event) {
        var hadClass = plugin.cmInstance.rootElement[0].querySelector('td.zeroclipboard-is-hover');
        if (hadClass) {
          Handsontable.Dom.removeClass(hadClass, 'zeroclipboard-is-hover');
        }
        plugin.instance.getSettings().outsideClickDeselects = plugin.outsideClickDeselectsCache;
      });
    }
  };

  /**
   * Initialize plugin
   * @returns {boolean} Returns false if ZeroClipboard is not properly included
   */
  ContextMenuCopyPaste.prototype.init = function () {
    if (!this.getSettings().contextMenuCopyPaste) {
      return;
    } else if (typeof this.getSettings().contextMenuCopyPaste == "object") {
      cmCopyPaste.swfPath = this.getSettings().contextMenuCopyPaste.swfPath;
    }

    if (typeof ZeroClipboard === 'undefined') {
      throw new Error("To be able to use the Copy/Paste feature from the context menu, you need to manualy include ZeroClipboard.js file to your website.");

      return false;
    }

    cmCopyPaste.instance = this;
    cmCopyPaste.prepareZeroClipboard();
  };

  var cmCopyPaste = new ContextMenuCopyPaste();

  Handsontable.hooks.add('afterRender', function () {
    cmCopyPaste.setupZeroClipboard(this);
  });

  Handsontable.hooks.add('afterInit', cmCopyPaste.init);
  Handsontable.hooks.add('afterContextMenuDefaultOptions', cmCopyPaste.addToContextMenu);
  Handsontable.ContextMenuCopyPaste = ContextMenuCopyPaste;

})(Handsontable);
