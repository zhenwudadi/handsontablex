import BasePlugin from './../_base';
import { addClass, hasClass, removeClass, outerWidth } from './../../helpers/dom/element';
import EventManager from './../../eventManager';
import { arrayEach } from './../../helpers/array';
import { rangeEach } from './../../helpers/number';
import { registerPlugin } from './../../plugins';
import { PhysicalIndexToValueMap as IndexToValueMap } from './../../translations';

// Developer note! Whenever you make a change in this file, make an analogous change in manualRowResize.js

const ROW_HEIGHTS_MAP_NAME = 'manualRowResize';
const PERSISTENT_STATE_KEY = 'manualRowHeights';
const privatePool = new WeakMap();

/**
 * @description
 * This plugin allows to change rows height. To make rows height persistent the {@link Options#persistentState}
 * plugin should be enabled.
 *
 * The plugin creates additional components to make resizing possibly using user interface:
 * - handle - the draggable element that sets the desired height of the row.
 * - guide - the helper guide that shows the desired height as a horizontal guide.
 *
 * @plugin ManualRowResize
 */
class ManualRowResize extends BasePlugin {
  constructor(hotInstance) {
    super(hotInstance);

    const { rootDocument } = this.hot;

    this.currentTH = null;
    this.currentRow = null;
    this.selectedRows = [];
    this.currentHeight = null;
    this.newSize = null;
    this.startY = null;
    this.startHeight = null;
    this.startOffset = null;
    this.handle = rootDocument.createElement('DIV');
    this.guide = rootDocument.createElement('DIV');
    this.eventManager = new EventManager(this);
    this.pressed = null;
    this.dblclick = 0;
    this.autoresizeTimeout = null;

    /**
     * PhysicalIndexToValueMap to keep and track widths for physical row indexes.
     *
     * @private
     * @type {PhysicalIndexToValueMap}
     */
    this.rowHeightsMap = void 0;
    /**
     * Private pool to save configuration from updateSettings.
     */
    privatePool.set(this, {
      config: void 0,
    });

    addClass(this.handle, 'manualRowResizer');
    addClass(this.guide, 'manualRowResizerGuide');
  }

  /**
   * Checks if the plugin is enabled in the handsontable settings. This method is executed in {@link Hooks#beforeInit}
   * hook and if it returns `true` than the {@link ManualRowResize#enablePlugin} method is called.
   *
   * @returns {boolean}
   */
  isEnabled() {
    return this.hot.getSettings().manualRowResize;
  }

  /**
   * Enables the plugin functionality for this Handsontable instance.
   */
  enablePlugin() {
    if (this.enabled) {
      return;
    }

    this.rowHeightsMap = new IndexToValueMap();
    this.rowHeightsMap.addLocalHook('init', () => this.onMapInit());
    this.hot.rowIndexMapper.registerMap(ROW_HEIGHTS_MAP_NAME, this.rowHeightsMap);

    this.addHook('modifyRowHeight', (height, row) => this.onModifyRowHeight(height, row));

    this.bindEvents();

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
    const priv = privatePool.get(this);
    priv.config = this.rowHeightsMap.getValues();

    this.hot.rowIndexMapper.unregisterMap(ROW_HEIGHTS_MAP_NAME);
    super.disablePlugin();
  }

  /**
   * Saves the current sizes using the persistentState plugin (the {@link Options#persistentState} option has to be enabled).
   *
   * @fires Hooks#persistentStateSave
   */
  saveManualRowHeights() {
    this.hot.runHooks('persistentStateSave', PERSISTENT_STATE_KEY, this.rowHeightsMap.getValues());
  }

  /**
   * Loads the previously saved sizes using the persistentState plugin (the {@link Options#persistentState} option has to be enabled).
   *
   * @returns {Array}
   * @fires Hooks#persistentStateLoad
   */
  loadManualRowHeights() {
    const storedState = {};

    this.hot.runHooks('persistentStateLoad', PERSISTENT_STATE_KEY, storedState);

    return storedState.value;
  }

  /**
   * Sets the new height for specified row index.
   *
   * @param {number} row Visual row index.
   * @param {number} height Row height.
   * @returns {number} Returns new height.
   */
  setManualSize(row, height) {
    const physicalRow = this.hot.toPhysicalRow(row);

    if (height < 0) {
      height = null; // Do not change default size.
    }

    this.rowHeightsMap.setValueAtIndex(physicalRow, height);

    return height;
  }

  /**
   * Sets the resize handle position.
   *
   * @private
   * @param {HTMLCellElement} TH TH HTML element.
   */
  setupHandlePosition(TH) {
    this.currentTH = TH;

    const cellCoords = this.hot.getCoords(this.currentTH);
    const row = cellCoords.row;
    const headerWidth = outerWidth(this.currentTH);

    if (row >= 0) { // if not col header
      const box = this.currentTH.getBoundingClientRect();
      const fixedRowTop = row < this.hot.getSettings().fixedRowsTop;
      const fixedRowBottom = row >= this.hot.countRows() - this.hot.getSettings().fixedRowsBottom;
      let parentOverlay = this.hot.view.wt.wtOverlays.leftOverlay;

      if (fixedRowTop) {
        parentOverlay = this.hot.view.wt.wtOverlays.topLeftCornerOverlay;

      } else if (fixedRowBottom) {
        parentOverlay = this.hot.view.wt.wtOverlays.bottomLeftCornerOverlay;
      }

      let relativeHeaderPosition = parentOverlay.getRelativeCellPosition(this.currentTH, cellCoords.row, cellCoords.col);

      // If the TH is not a child of the left/top-left/bottom-left overlay, recalculate using the top-most header
      if (!relativeHeaderPosition) {
        const topMostHeader = parentOverlay.clone.wtTable.TBODY.children[+!!this.hot.getSettings().colHeaders + row].firstChild;
        relativeHeaderPosition = parentOverlay.getRelativeCellPosition(topMostHeader, cellCoords.row, cellCoords.col);
      }

      this.currentRow = row;
      this.selectedRows = [];

      if (this.hot.selection.isSelected() && this.hot.selection.isSelectedByRowHeader()) {
        const { from, to } = this.hot.getSelectedRangeLast();
        let start = from.row;
        let end = to.row;

        if (start >= end) {
          start = to.row;
          end = from.row;
        }

        if (this.currentRow >= start && this.currentRow <= end) {
          rangeEach(start, end, i => this.selectedRows.push(i));

        } else {
          this.selectedRows.push(this.currentRow);
        }

      } else {
        this.selectedRows.push(this.currentRow);
      }

      this.startOffset = relativeHeaderPosition.top - 6;
      this.startHeight = parseInt(box.height, 10);

      this.handle.style.top = `${this.startOffset + this.startHeight}px`;
      this.handle.style.left = `${relativeHeaderPosition.left}px`;

      this.handle.style.width = `${headerWidth}px`;
      this.hot.rootElement.appendChild(this.handle);
    }
  }

  /**
   * Refresh the resize handle position.
   *
   * @private
   */
  refreshHandlePosition() {
    this.handle.style.top = `${this.startOffset + this.currentHeight}px`;
  }

  /**
   * Sets the resize guide position.
   *
   * @private
   */
  setupGuidePosition() {
    const handleWidth = parseInt(outerWidth(this.handle), 10);
    const handleRightPosition = parseInt(this.handle.style.left, 10) + handleWidth;
    const maximumVisibleElementWidth = parseInt(this.hot.view.maximumVisibleElementWidth(0), 10);
    addClass(this.handle, 'active');
    addClass(this.guide, 'active');

    this.guide.style.top = this.handle.style.top;
    this.guide.style.left = `${handleRightPosition}px`;
    this.guide.style.width = `${maximumVisibleElementWidth - handleWidth}px`;
    this.hot.rootElement.appendChild(this.guide);
  }

  /**
   * Refresh the resize guide position.
   *
   * @private
   */
  refreshGuidePosition() {
    this.guide.style.top = this.handle.style.top;
  }

  /**
   * Hides both the resize handle and resize guide.
   *
   * @private
   */
  hideHandleAndGuide() {
    removeClass(this.handle, 'active');
    removeClass(this.guide, 'active');
  }

  /**
   * Checks if provided element is considered as a row header.
   *
   * @private
   * @param {HTMLElement} element HTML element.
   * @returns {boolean}
   */
  checkIfRowHeader(element) {
    if (element !== this.hot.rootElement) {
      const parent = element.parentNode;

      if (parent.tagName === 'TBODY') {
        return true;
      }

      return this.checkIfRowHeader(parent);
    }

    return false;
  }

  /**
   * Gets the TH element from the provided element.
   *
   * @private
   * @param {HTMLElement} element HTML element.
   * @returns {HTMLElement}
   */
  getTHFromTargetElement(element) {
    if (element.tagName !== 'TABLE') {
      if (element.tagName === 'TH') {
        return element;
      }
      return this.getTHFromTargetElement(element.parentNode);

    }

    return null;
  }

  /**
   * 'mouseover' event callback - set the handle position.
   *
   * @private
   * @param {MouseEvent} event The mouse event.
   */
  onMouseOver(event) {
    if (this.checkIfRowHeader(event.target)) {
      const th = this.getTHFromTargetElement(event.target);

      if (th) {
        if (!this.pressed) {
          this.setupHandlePosition(th);
        }
      }
    }
  }

  /**
   * Auto-size row after doubleclick - callback.
   *
   * @private
   * @fires Hooks#beforeRowResize
   * @fires Hooks#afterRowResize
   */
  afterMouseDownTimeout() {
    const render = () => {
      this.hot.forceFullRender = true;
      this.hot.view.render(); // updates all
      this.hot.view.wt.wtOverlays.adjustElementsSize(true);
    };
    const resize = (row, forceRender) => {
      const hookNewSize = this.hot.runHooks('beforeRowResize', this.newSize, row, true);

      if (hookNewSize !== void 0) {
        this.newSize = hookNewSize;
      }

      this.setManualSize(row, this.newSize); // double click sets auto row size

      this.hot.runHooks('afterRowResize', this.newSize, row, true);

      if (forceRender) {
        render();
      }
    };

    if (this.dblclick >= 2) {
      const selectedRowsLength = this.selectedRows.length;

      if (selectedRowsLength > 1) {
        arrayEach(this.selectedRows, (selectedRow) => {
          resize(selectedRow);
        });
        render();
      } else {
        arrayEach(this.selectedRows, (selectedRow) => {
          resize(selectedRow, true);
        });
      }
    }
    this.dblclick = 0;
    this.autoresizeTimeout = null;
  }

  /**
   * 'mousedown' event callback.
   *
   * @private
   * @param {MouseEvent} event The mouse event.
   */
  onMouseDown(event) {
    if (hasClass(event.target, 'manualRowResizer')) {
      this.setupGuidePosition();
      this.pressed = this.hot;

      if (this.autoresizeTimeout === null) {
        this.autoresizeTimeout = setTimeout(() => this.afterMouseDownTimeout(), 500);

        this.hot._registerTimeout(this.autoresizeTimeout);
      }

      this.dblclick += 1;
      this.startY = event.pageY;
      this.newSize = this.startHeight;
    }
  }

  /**
   * 'mousemove' event callback - refresh the handle and guide positions, cache the new row height.
   *
   * @private
   * @param {MouseEvent} event The mouse event.
   */
  onMouseMove(event) {
    if (this.pressed) {
      this.currentHeight = this.startHeight + (event.pageY - this.startY);

      arrayEach(this.selectedRows, (selectedRow) => {
        this.newSize = this.setManualSize(selectedRow, this.currentHeight);
      });

      this.refreshHandlePosition();
      this.refreshGuidePosition();
    }
  }

  /**
   * 'mouseup' event callback - apply the row resizing.
   *
   * @private
   *
   * @fires Hooks#beforeRowResize
   * @fires Hooks#afterRowResize
   */
  onMouseUp() {
    const render = () => {
      this.hot.forceFullRender = true;
      this.hot.view.render(); // updates all
      this.hot.view.wt.wtOverlays.adjustElementsSize(true);
    };
    const runHooks = (row, forceRender) => {
      this.hot.runHooks('beforeRowResize', this.newSize, row, false);

      if (forceRender) {
        render();
      }

      this.saveManualRowHeights();

      this.hot.runHooks('afterRowResize', this.newSize, row, false);
    };
    if (this.pressed) {
      this.hideHandleAndGuide();
      this.pressed = false;

      if (this.newSize !== this.startHeight) {
        const selectedRowsLength = this.selectedRows.length;

        if (selectedRowsLength > 1) {
          arrayEach(this.selectedRows, (selectedRow) => {
            runHooks(selectedRow);
          });
          render();
        } else {
          arrayEach(this.selectedRows, (selectedRow) => {
            runHooks(selectedRow, true);
          });
        }
      }

      this.setupHandlePosition(this.currentTH);
    }
  }

  /**
   * Binds the mouse events.
   *
   * @private
   */
  bindEvents() {
    const { rootElement, rootWindow } = this.hot;
    this.eventManager.addEventListener(rootElement, 'mouseover', e => this.onMouseOver(e));
    this.eventManager.addEventListener(rootElement, 'mousedown', e => this.onMouseDown(e));
    this.eventManager.addEventListener(rootWindow, 'mousemove', e => this.onMouseMove(e));
    this.eventManager.addEventListener(rootWindow, 'mouseup', () => this.onMouseUp());
  }

  /**
   * Modifies the provided row height, based on the plugin settings.
   *
   * @private
   * @param {number} height Row height.
   * @param {number} row Visual row index.
   * @returns {number}
   */
  onModifyRowHeight(height, row) {
    let newHeight = height;

    if (this.enabled) {
      const physicalRow = this.hot.toPhysicalRow(row);
      const rowHeight = this.rowHeightsMap.getValueAtIndex(physicalRow);

      if (this.hot.getSettings().manualRowResize && rowHeight) {
        newHeight = rowHeight;
      }
    }

    return newHeight;
  }

  /**
   * Callback to call on map's `init` local hook.
   *
   * @private
   */
  onMapInit() {
    const priv = privatePool.get(this);
    const initialSetting = this.hot.getSettings().manualRowResize;
    const loadedManualRowHeights = this.loadManualRowHeights();

    this.hot.executeBatchOperations(() => {
      if (typeof loadedManualRowHeights !== 'undefined') {
        loadedManualRowHeights.forEach((height, index) => {
          this.rowHeightsMap.setValueAtIndex(index, height);
        });

      } else if (Array.isArray(initialSetting)) {

        initialSetting.forEach((height, index) => {
          this.rowHeightsMap.setValueAtIndex(index, height);
        });

        priv.config = initialSetting;

      } else if (initialSetting === true && Array.isArray(priv.config)) {
        priv.config.forEach((height, index) => {
          this.rowHeightsMap.setValueAtIndex(index, height);
        });
      }
    });
  }

  /**
   * Destroys the plugin instance.
   */
  destroy() {
    this.hot.rowIndexMapper.unregisterMap(ROW_HEIGHTS_MAP_NAME);

    super.destroy();
  }
}

registerPlugin('manualRowResize', ManualRowResize);

export default ManualRowResize;
