import BasePlugin from '../_base';
import { objectEach } from '../../helpers/object';
import { registerPlugin } from '../../plugins';
import Endpoints from './endpoints';

/**
 * @plugin ColumnSummary
 *
 * @description
 * Allows making pre-defined calculations on the cell values and display the results within Handsontable.
 * [See the demo for more information](https://handsontable.com/docs/demo-summary-calculations.html).
 *
 * @example
 * const container = document.getElementById('example');
 * const hot = new Handsontable(container, {
 *   data: getData(),
 *   colHeaders: true,
 *   rowHeaders: true,
 *   columnSummary: [
 *     {
 *       destinationRow: 4,
 *       destinationColumn: 1,
 *       type: 'min'
 *     },
 *     {
 *       destinationRow: 0,
 *       destinationColumn: 3,
 *       reversedRowCoords: true,
 *       type: 'max'
 *     },
 *     {
 *       destinationRow: 4,
 *       destinationColumn: 5,
 *       type: 'sum',
 *       forceNumeric: true
 *     }
 *   ]
 * });
 */
class ColumnSummary extends BasePlugin {
  constructor(hotInstance) {
    super(hotInstance);
    /**
     * The Endpoints class instance. Used to make all endpoint-related operations.
     *
     * @private
     * @type {null|Endpoints}
     */
    this.endpoints = null;
  }

  /**
   * Checks if the plugin is enabled in the handsontable settings. This method is executed in {@link Hooks#beforeInit}
   * hook and if it returns `true` than the {@link ColumnSummary#enablePlugin} method is called.
   *
   * @returns {boolean}
   */
  isEnabled() {
    return !!this.hot.getSettings().columnSummary;
  }

  /**
   * Enables the plugin functionality for this Handsontable instance.
   */
  enablePlugin() {
    if (this.enabled) {
      return;
    }

    this.settings = this.hot.getSettings().columnSummary;
    this.endpoints = new Endpoints(this, this.settings);

    this.addHook('afterInit', (...args) => this.onAfterInit(...args));
    this.addHook('afterChange', (...args) => this.onAfterChange(...args));

    this.addHook('beforeCreateRow', (index, amount, source) => this.endpoints.resetSetupBeforeStructureAlteration('insert_row', index, amount, null, source));
    this.addHook('beforeCreateCol', (index, amount, source) => this.endpoints.resetSetupBeforeStructureAlteration('insert_col', index, amount, null, source));
    this.addHook('beforeRemoveRow', (...args) => this.endpoints.resetSetupBeforeStructureAlteration('remove_row', ...args));
    this.addHook('beforeRemoveCol', (...args) => this.endpoints.resetSetupBeforeStructureAlteration('remove_col', ...args));

    this.addHook('afterCreateRow', (index, amount, source) => this.endpoints.resetSetupAfterStructureAlteration('insert_row', index, amount, null, source));
    this.addHook('afterCreateCol', (index, amount, source) => this.endpoints.resetSetupAfterStructureAlteration('insert_col', index, amount, null, source));
    this.addHook('afterRemoveRow', (...args) => this.endpoints.resetSetupAfterStructureAlteration('remove_row', ...args));
    this.addHook('afterRemoveCol', (...args) => this.endpoints.resetSetupAfterStructureAlteration('remove_col', ...args));
    this.addHook('afterRowMove', (...args) => this.onAfterRowMove(...args));

    super.enablePlugin();
  }

  /**
   * Disables the plugin functionality for this Handsontable instance.
   */
  disablePlugin() {
    this.endpoints = null;
    this.settings = null;
    this.currentEndpoint = null;
  }

  /**
   * Calculates math for a single endpoint.
   *
   * @private
   * @param {object} endpoint Contains information about the endpoint.
   */
  calculate(endpoint) {
    switch (endpoint.type.toLowerCase()) {
      case 'sum':
        endpoint.result = this.calculateSum(endpoint);
        break;
      case 'min':
        endpoint.result = this.calculateMinMax(endpoint, endpoint.type);
        break;
      case 'max':
        endpoint.result = this.calculateMinMax(endpoint, endpoint.type);
        break;
      case 'count':
        endpoint.result = this.countEntries(endpoint);
        break;
      case 'average':
        endpoint.result = this.calculateAverage(endpoint);
        break;
      case 'custom':
        endpoint.result = endpoint.customFunction.call(this, endpoint);
        break;
      default:
        break;
    }
  }

  /**
   * Calculates sum of the values contained in ranges provided in the plugin config.
   *
   * @private
   * @param {object} endpoint Contains the endpoint information.
   * @returns {number} Sum for the selected range.
   */
  calculateSum(endpoint) {
    let sum = 0;

    objectEach(endpoint.ranges, (range) => {
      sum += this.getPartialSum(range, endpoint.sourceColumn);
    });

    return sum;
  }

  /**
   * Returns partial sum of values from a single row range.
   *
   * @private
   * @param {Array} rowRange Range for the sum.
   * @param {number} col Column index.
   * @returns {number} The partial sum.
   */
  getPartialSum(rowRange, col) {
    let sum = 0;
    let i = rowRange[1] || rowRange[0];
    let cellValue = null;
    let biggestDecimalPlacesCount = 0;

    do {
      cellValue = this.getCellValue(i, col) || 0;
      const decimalPlaces = (((`${cellValue}`).split('.')[1] || []).length) || 1;
      if (decimalPlaces > biggestDecimalPlacesCount) {
        biggestDecimalPlacesCount = decimalPlaces;
      }

      sum += cellValue || 0;
      i -= 1;
    } while (i >= rowRange[0]);

    // Workaround for e.g. 802.2 + 1.1 = 803.3000000000001
    return Math.round(sum * (10 ** biggestDecimalPlacesCount)) / (10 ** biggestDecimalPlacesCount);
  }

  /**
   * Calculates the minimal value for the selected ranges.
   *
   * @private
   * @param {object} endpoint Contains the endpoint information.
   * @param {string} type `'min'` or `'max'`.
   * @returns {number} Min or Max value.
   */
  calculateMinMax(endpoint, type) {
    let result = null;

    objectEach(endpoint.ranges, (range) => {
      const partialResult = this.getPartialMinMax(range, endpoint.sourceColumn, type);

      if (result === null && partialResult !== null) {
        result = partialResult;
      }

      if (partialResult !== null) {
        switch (type) {
          case 'min':
            result = Math.min(result, partialResult);
            break;
          case 'max':
            result = Math.max(result, partialResult);
            break;
          default:
            break;
        }
      }
    });

    return result === null ? 'Not enough data' : result;
  }

  /**
   * Returns a local minimum of the provided sub-range.
   *
   * @private
   * @param {Array} rowRange Range for the calculation.
   * @param {number} col Column index.
   * @param {string} type `'min'` or `'max'`.
   * @returns {number} Min or max value.
   */
  getPartialMinMax(rowRange, col, type) {
    let result = null;
    let i = rowRange[1] || rowRange[0];
    let cellValue;

    do {
      cellValue = this.getCellValue(i, col) || null;

      if (result === null) {
        result = cellValue;
      } else if (cellValue !== null) {
        switch (type) {
          case 'min':
            result = Math.min(result, cellValue);
            break;
          case 'max':
            result = Math.max(result, cellValue);
            break;
          default:
            break;
        }

      }

      i -= 1;
    } while (i >= rowRange[0]);

    return result;
  }

  /**
   * Counts empty cells in the provided row range.
   *
   * @private
   * @param {Array} rowRange Row range for the calculation.
   * @param {number} col Column index.
   * @returns {number} Empty cells count.
   */
  countEmpty(rowRange, col) {
    let cellValue;
    let counter = 0;
    let i = rowRange[1] || rowRange[0];

    do {
      cellValue = this.getCellValue(i, col);

      if (!cellValue) {
        counter += 1;
      }

      i -= 1;
    } while (i >= rowRange[0]);

    return counter;
  }

  /**
   * Counts non-empty cells in the provided row range.
   *
   * @private
   * @param {object} endpoint Contains the endpoint information.
   * @returns {number} Entry count.
   */
  countEntries(endpoint) {
    let result = 0;
    const ranges = endpoint.ranges;

    objectEach(ranges, (range) => {
      const partial = range[1] === void 0 ? 1 : range[1] - range[0] + 1;
      const emptyCount = this.countEmpty(range, endpoint.sourceColumn);

      result += partial;
      result -= emptyCount;
    });

    return result;
  }

  /**
   * Calculates the average value from the cells in the range.
   *
   * @private
   * @param {object} endpoint Contains the endpoint information.
   * @returns {number} Avarage value.
   */
  calculateAverage(endpoint) {
    const sum = this.calculateSum(endpoint);
    const entriesCount = this.countEntries(endpoint);

    return sum / entriesCount;
  }

  /**
   * Returns a cell value, taking into consideration a basic validation.
   *
   * @private
   * @param {number} row Row index.
   * @param {number} col Column index.
   * @returns {string} The cell value.
   */
  getCellValue(row, col) {
    const visualRowIndex = this.hot.toVisualRow(row);
    const visualColumnIndex = this.hot.toVisualColumn(col);

    let cellValue = this.hot.getSourceDataAtCell(row, col);
    let cellClassName = '';

    if (visualRowIndex !== null && visualColumnIndex !== null) {
      cellClassName = this.hot.getCellMeta(visualRowIndex, visualColumnIndex).className || '';
    }

    if (cellClassName.indexOf('columnSummaryResult') > -1) {
      return null;
    }

    if (this.endpoints.currentEndpoint.forceNumeric) {
      if (typeof cellValue === 'string') {
        cellValue = cellValue.replace(/,/, '.');
      }

      cellValue = parseFloat(cellValue);
    }

    if (isNaN(cellValue)) {
      if (!this.endpoints.currentEndpoint.suppressDataTypeErrors) {
        throw new Error(`ColumnSummary plugin: cell at (${row}, ${col}) is not in a numeric format. Cannot do the calculation.`);
      }
    }

    return cellValue;
  }

  /**
   * `afterInit` hook callback.
   *
   * @private
   */
  onAfterInit() {
    this.endpoints.endpoints = this.endpoints.parseSettings();
    this.endpoints.refreshAllEndpoints(true);
  }

  /**
   * `afterChange` hook callback.
   *
   * @private
   * @param {Array} changes 2D array containing information about each of the edited cells.
   * @param {string} source The string that identifies source of changes.
   */
  onAfterChange(changes, source) {
    if (changes && source !== 'ColumnSummary.reset' && source !== 'ColumnSummary.set' && source !== 'loadData') {
      this.endpoints.refreshChangedEndpoints(changes);
    }
  }

  /**
   * `beforeRowMove` hook callback.
   *
   * @private
   * @param {Array} rows Array of visual row indexes to be moved.
   * @param {number} finalIndex Visual row index, being a start index for the moved rows. Points to where the elements will be placed after the moving action.
   * To check the visualization of the final index, please take a look at [documentation](/demo-moving.html#manualRowMove).
   */
  onAfterRowMove(rows, finalIndex) {
    this.endpoints.resetSetupBeforeStructureAlteration('move_row', rows[0], rows.length, rows, this.pluginName);
    this.endpoints.resetSetupAfterStructureAlteration('move_row', finalIndex, rows.length, rows, this.pluginName);
  }
}

registerPlugin('columnSummary', ColumnSummary);

export default ColumnSummary;
