import BasePlugin from '../_base';
import { addClass } from '../../helpers/dom/element';
import { rangeEach } from '../../helpers/number';
import { arrayEach, arrayMap } from '../../helpers/array';
import { isObject } from '../../helpers/object';
import { isUndefined } from '../../helpers/mixed';
import { registerPlugin } from '../../plugins';
import { SEPARATOR } from '../contextMenu/predefinedItems';
import Hooks from '../../pluginHooks';
import hideRowItem from './contextMenuItem/hideRow';
import showRowItem from './contextMenuItem/showRow';
import { HidingMap } from '../../translations';

import './hiddenRows.css';

Hooks.getSingleton().register('beforeHideRows');
Hooks.getSingleton().register('afterHideRows');
Hooks.getSingleton().register('beforeUnhideRows');
Hooks.getSingleton().register('afterUnhideRows');

/**
 * @plugin HiddenRows
 *
 * @description
 * Plugin allows to hide certain rows. The hiding is achieved by rendering the rows with height set as 0px.
 * The plugin not modifies the source data and do not participate in data transformation (the shape of data returned
 * by `getData*` methods stays intact).
 *
 * Possible plugin settings:
 *  * `copyPasteEnabled` as `Boolean` (default `true`)
 *  * `rows` as `Array`
 *  * `indicators` as `Boolean` (default `false`).
 *
 * @example
 *
 * ```js
 * const container = document.getElementById('example');
 * const hot = new Handsontable(container, {
 *   date: getData(),
 *   hiddenRows: {
 *     copyPasteEnabled: true,
 *     indicators: true,
 *     rows: [1, 2, 5]
 *   }
 * });
 *
 * // access to hiddenRows plugin instance
 * const hiddenRowsPlugin = hot.getPlugin('hiddenRows');
 *
 * // show single row
 * hiddenRowsPlugin.showRow(1);
 *
 * // show multiple rows
 * hiddenRowsPlugin.showRow(1, 2, 9);
 *
 * // or as an array
 * hiddenRowsPlugin.showRows([1, 2, 9]);
 *
 * // hide single row
 * hiddenRowsPlugin.hideRow(1);
 *
 * // hide multiple rows
 * hiddenRowsPlugin.hideRow(1, 2, 9);
 *
 * // or as an array
 * hiddenRowsPlugin.hideRows([1, 2, 9]);
 *
 * // rerender the table to see all changes
 * hot.render();
 * ```
 */
class HiddenRows extends BasePlugin {
  /**
   * Cached settings from Handsontable settings.
   *
   * @private
   * @type {object}
   */
  #settings = {};
  /**
   * Map of hidden rows by the plugin.
   *
   * @private
   * @type {HidingMap|null}
   */
  #hiddenRowsMap = null;

  /**
   * Checks if the plugin is enabled in the handsontable settings. This method is executed in {@link Hooks#beforeInit}
   * hook and if it returns `true` than the {@link HiddenRows#enablePlugin} method is called.
   *
   * @returns {boolean}
   */
  isEnabled() {
    return !!this.hot.getSettings().hiddenRows;
  }

  /**
   * Enables the plugin functionality for this Handsontable instance.
   */
  enablePlugin() {
    if (this.enabled) {
      return;
    }

    const pluginSettings = this.hot.getSettings().hiddenRows;

    if (isObject(pluginSettings)) {
      this.#settings = pluginSettings;

      if (isUndefined(pluginSettings.copyPasteEnabled)) {
        pluginSettings.copyPasteEnabled = true;
      }
    }

    this.#hiddenRowsMap = new HidingMap();
    this.#hiddenRowsMap.addLocalHook('init', () => this.onMapInit());
    this.hot.rowIndexMapper.registerMap(this.pluginName, this.#hiddenRowsMap);

    this.addHook('afterContextMenuDefaultOptions', (...args) => this.onAfterContextMenuDefaultOptions(...args));
    this.addHook('afterGetCellMeta', (row, col, cellProperties) => this.onAfterGetCellMeta(row, col, cellProperties));
    this.addHook('modifyRowHeight', (height, row) => this.onModifyRowHeight(height, row));
    this.addHook('afterGetRowHeader', (...args) => this.onAfterGetRowHeader(...args));
    this.addHook('modifyCopyableRange', ranges => this.onModifyCopyableRange(ranges));

    super.enablePlugin();
  }

  /**
   * Updates the plugin state. This method is executed when {@link Core#updateSettings} is invoked.
   */
  updatePlugin() {
    this.disablePlugin();
    this.enablePlugin();

    super.updatePlugin();
  }

  /**
   * Disables the plugin functionality for this Handsontable instance.
   */
  disablePlugin() {
    this.hot.rowIndexMapper.unregisterMap(this.pluginName);
    this.#settings = {};

    super.disablePlugin();
    this.resetCellsMeta();
  }

  /**
   * Shows the rows provided in the array.
   *
   * @param {number[]} rows Array of visual row indexes.
   */
  showRows(rows) {
    const currentHideConfig = this.getHiddenRows();
    const isConfigValid = this.isValidConfig(rows);
    let destinationHideConfig = currentHideConfig;

    if (isConfigValid) {
      destinationHideConfig = currentHideConfig.filter(row => rows.includes(row) === false);
    }

    const continueHiding = this.hot.runHooks('beforeUnhideRows', currentHideConfig, destinationHideConfig, isConfigValid);

    if (continueHiding === false) {
      return;
    }

    if (isConfigValid) {
      this.hot.executeBatchOperations(() => {
        arrayEach(rows, (visualRow) => {
          this.#hiddenRowsMap.setValueAtIndex(this.hot.toPhysicalRow(visualRow), false);
        });
      });
    }

    this.hot.runHooks('afterUnhideRows', currentHideConfig, destinationHideConfig, isConfigValid,
      isConfigValid && destinationHideConfig.length < currentHideConfig.length);
  }

  /**
   * Shows the row provided as row index (counting from 0).
   *
   * @param {...number} row Visual row index.
   */
  showRow(...row) {
    this.showRows(row);
  }

  /**
   * Hides the rows provided in the array.
   *
   * @param {number[]} rows Array of visual row indexes.
   */
  hideRows(rows) {
    const currentHideConfig = this.getHiddenRows();
    const isConfigValid = this.isValidConfig(rows);
    let destinationHideConfig = currentHideConfig;

    if (isConfigValid) {
      destinationHideConfig = Array.from(new Set(currentHideConfig.concat(rows)));
    }

    const continueHiding = this.hot.runHooks('beforeHideRows', currentHideConfig, destinationHideConfig, isConfigValid);

    if (continueHiding === false) {
      return;
    }

    if (isConfigValid) {
      this.hot.executeBatchOperations(() => {
        arrayEach(rows, (visualRow) => {
          this.#hiddenRowsMap.setValueAtIndex(this.hot.toPhysicalRow(visualRow), true);
        });
      });
    }

    this.hot.runHooks('afterHideRows', currentHideConfig, destinationHideConfig, isConfigValid,
      isConfigValid && destinationHideConfig.length > currentHideConfig.length);
  }

  /**
   * Hides the row provided as row index (counting from 0).
   *
   * @param {...number} row Visual row index.
   */
  hideRow(...row) {
    this.hideRows(row);
  }

  /**
   * Returns an array of visual indexes of hidden rows.
   *
   * @returns {number[]}
   */
  getHiddenRows() {
    return arrayMap(this.#hiddenRowsMap.getHiddenIndexes(), (physicalRowIndex) => {
      return this.hot.toVisualRow(physicalRowIndex);
    });
  }

  /**
   * Checks if the provided row is hidden.
   *
   * @param {number} row Visual row index.
   * @returns {boolean}
   */
  isHidden(row) {
    return this.#hiddenRowsMap.getValueAtIndex(this.hot.toPhysicalRow(row)) || false;
  }

  /**
   * Checks whether all of the provided row indexes are within the bounds of the table.
   *
   * @param {Array} hiddenRows List of hidden visual row indexes.
   * @returns {boolean}
   */
  isValidConfig(hiddenRows) {
    const nrOfRows = this.hot.countRows();

    if (Array.isArray(hiddenRows) && hiddenRows.length > 0) {
      return hiddenRows.every(visualRow => Number.isInteger(visualRow) && visualRow >= 0 && visualRow < nrOfRows);
    }

    return false;
  }

  /**
   * Resets all rendered cells meta.
   *
   * @private
   */
  resetCellsMeta() {
    arrayEach(this.hot.getCellsMeta(), (meta) => {
      if (meta) {
        meta.skipRowOnPaste = false;
      }
    });
  }

  /**
   * Adds the additional row height for the hidden row indicators.
   *
   * @private
   * @param {number|undefined} height Row height.
   * @param {number} row Visual row index.
   * @returns {number}
   */
  onModifyRowHeight(height, row) {
    // Hook is triggered internally only for the visible rows. Conditional will be handled for the API
    // calls of the `getRowHeight` function on not visible indexes.
    if (this.isHidden(row)) {
      return 0;
    }

    return height;
  }

  /**
   * Sets the copy-related cell meta.
   *
   * @private
   * @param {number} row Visual row index.
   * @param {number} column Visual column index.
   * @param {object} cellProperties Object containing the cell properties.
   */
  onAfterGetCellMeta(row, column, cellProperties) {
    if (this.#settings.copyPasteEnabled === false && this.isHidden(row)) {
      // Cell property handled by the `Autofill` and the `CopyPaste` plugins.
      cellProperties.skipRowOnPaste = true;
    }

    if (this.isHidden(row - 1)) {
      cellProperties.className = cellProperties.className || '';

      if (cellProperties.className.indexOf('afterHiddenRow') === -1) {
        cellProperties.className += ' afterHiddenRow';
      }
    } else if (cellProperties.className) {
      const classArr = cellProperties.className.split(' ');

      if (classArr.length > 0) {
        const containAfterHiddenRow = classArr.indexOf('afterHiddenRow');

        if (containAfterHiddenRow > -1) {
          classArr.splice(containAfterHiddenRow, 1);
        }

        cellProperties.className = classArr.join(' ');
      }
    }
  }

  /**
   * Modifies the copyable range, accordingly to the provided config.
   *
   * @private
   * @param {Array} ranges An array of objects defining copyable cells.
   * @returns {Array}
   */
  onModifyCopyableRange(ranges) {
    // Ranges shouldn't be modified when `copyPasteEnabled` option is set to `true` (by default).
    if (this.#settings.copyPasteEnabled) {
      return ranges;
    }

    const newRanges = [];

    const pushRange = (startRow, endRow, startCol, endCol) => {
      newRanges.push({ startRow, endRow, startCol, endCol });
    };

    arrayEach(ranges, (range) => {
      let isHidden = true;
      let rangeStart = 0;

      rangeEach(range.startRow, range.endRow, (visualRow) => {
        if (this.isHidden(visualRow)) {
          if (!isHidden) {
            pushRange(rangeStart, visualRow - 1, range.startCol, range.endCol);
          }

          isHidden = true;

        } else {
          if (isHidden) {
            rangeStart = visualRow;
          }

          if (visualRow === range.endRow) {
            pushRange(rangeStart, visualRow, range.startCol, range.endCol);
          }

          isHidden = false;
        }
      });
    });

    return newRanges;
  }

  /**
   * Adds the needed classes to the headers.
   *
   * @private
   * @param {number} row Visual row index.
   * @param {HTMLElement} TH Header's TH element.
   */
  onAfterGetRowHeader(row, TH) {
    if (!this.#settings.indicators || row < 0) {
      return;
    }

    const classList = [];

    if (row >= 1 && this.isHidden(row - 1)) {
      classList.push('afterHiddenRow');
    }

    if (row < this.hot.countRows() - 1 && this.isHidden(row + 1)) {
      classList.push('beforeHiddenRow');
    }

    addClass(TH, classList);
  }

  /**
   * Add Show-hide rows to context menu.
   *
   * @private
   * @param {object} options An array of objects containing information about the pre-defined Context Menu items.
   */
  onAfterContextMenuDefaultOptions(options) {
    options.items.push(
      {
        name: SEPARATOR
      },
      hideRowItem(this),
      showRowItem(this)
    );
  }

  /**
   * On map initialized hook callback.
   *
   * @private
   */
  onMapInit() {
    if (Array.isArray(this.#settings.rows)) {
      this.hideRows(this.#settings.rows);
    }
  }

  /**
   * Destroys the plugin instance.
   */
  destroy() {
    this.hot.rowIndexMapper.unregisterMap(this.pluginName);
    this.#settings = null;
    this.#hiddenRowsMap = null;

    super.destroy();
  }
}

registerPlugin('hiddenRows', HiddenRows);

export default HiddenRows;
