
import BasePlugin from './../_base';
import {arrayEach} from './../../helpers/array';
import {CommandExecutor} from './commandExecutor';
import {EventManager} from './../../eventManager';
import {hasClass} from './../../helpers/dom/element';
import {ItemsFactory} from './itemsFactory';
import {Menu} from './menu';
import {registerPlugin} from './../../plugins';
import {SEPARATOR} from './predefinedItems';
import {stopPropagation} from './../../helpers/dom/event';


/**
 * @plugin ContextMenu
 */
class ContextMenu extends BasePlugin {
  constructor(hotInstance) {
    super(hotInstance);
    this.eventManager = new EventManager(this);
    this.itemsFactory = new ItemsFactory(this.hot);
    this.commandExecutor = new CommandExecutor(this.hot);
    this.menu = null;
    this.menuItems = null;
  }

  /**
   * Check if the plugin is enabled in the handsontable settings.
   *
   * @returns {Boolean}
   */
  isEnabled() {
    return this.hot.getSettings().contextMenu;
  }

  /**
   * Enable plugin for this Handsontable instance.
   */
  enablePlugin() {
    if (this.enabled) {
      return;
    }
    this.menuItems = this.itemsFactory.getVisibleItems(this.hot.getSettings().contextMenu);
    this.registerEvents();

    this.hot.runHooks('afterContextMenuDefaultOptions', {
      items: this.menuItems
    });
    this.menu = new Menu(this.hot);
    this.menu.setMenuItems(this.menuItems);
    this.hot.addHook('menuExecuteCommand', (...params) => this.executeCommand.apply(this, params));
    super.enablePlugin();

    const origItems = this.itemsFactory.getItems();

    // Register commands added by user or by plugins
    arrayEach(this.menuItems, (command) => {
      if (origItems.indexOf(command) === -1 && command.name !== SEPARATOR) {
        this.commandExecutor.registerCommand(command.key, command);
      }
    });
  }

  /**
   * Disable plugin for this Handsontable instance.
   */
  disablePlugin() {
    this.close();

    if (this.menu) {
      this.menu.destroy();
      this.menu = null;
    }
    super.disablePlugin();
  }

  /**
   * Register dom listeners.
   *
   * @private
   */
  registerEvents() {
    this.eventManager.addEventListener(this.hot.rootElement, 'contextmenu', (event) => this.onContextMenu(event));
  }

  /**
   * Open menu and re-position it based on dom event object.
   *
   * @param {Event} event
   */
  open(event) {
    if (!this.menu) {
      return;
    }
    this.menu.open();
    this.menu.setPosition(event);

    // ContextMenu is not detected HotTableEnv correctly because is injected outside hot-table
    this.menu.hotMenu.isHotTableEnv = this.hot.isHotTableEnv;
    Handsontable.eventManager.isHotTableEnv = this.hot.isHotTableEnv;
    this.hot.runHooks('afterContextMenuShow', this.menu.hotMenu);
  }

  /**
   * Close menu.
   */
  close() {
    if (!this.menu) {
      return;
    }
    this.menu.close();
    this.hot.listen();
    this.hot.runHooks('afterContextMenuHide', this.hot);
  }

  /**
   * Execute context menu command.
   *
   * @param {String} commandName
   * @param {*} params
   */
  executeCommand(...params) {
    this.commandExecutor.execute.apply(this.commandExecutor, params);
  }

  /**
   * Destroy instance.
   */
  destroy() {
    this.close();

    if (this.menu) {
      this.menu.destroy();
    }
    super.destroy();
  }

  /**
   * On context menu listener.
   *
   * @private
   * @param {Event} event
   */
  onContextMenu(event) {
    let settings = this.hot.getSettings();
    let showRowHeaders = settings.rowHeaders;
    let showColHeaders = settings.colHeaders;

    function isValidElement(element) {
      return element.nodeName === 'TD' || element.parentNode.nodeName === 'TD';
    }
    // if event is from hot-table we must get web component element not element inside him
    let element = event.realTarget;
    this.close();

    event.preventDefault();
    stopPropagation(event);

    if (!(showRowHeaders || showColHeaders)) {
      if (!isValidElement(element) && !(hasClass(element, 'current') && hasClass(element, 'wtBorder'))) {
        return;
      }
    } else if (showRowHeaders && showColHeaders) {
      // do nothing after right-click on corner header
      let containsCornerHeader = element.parentNode.querySelectorAll('.cornerHeader').length > 0;

      if (containsCornerHeader) {
        return;
      }
    }
    this.open(event);
  }
}

ContextMenu.SEPARATOR = {
  name: SEPARATOR
};


Handsontable.hooks.register('afterContextMenuDefaultOptions');
Handsontable.hooks.register('afterContextMenuShow');
Handsontable.hooks.register('afterContextMenuHide');
Handsontable.hooks.register('afterContextMenuExecute');

export {ContextMenu};

registerPlugin('contextMenu', ContextMenu);

Handsontable.plugins = Handsontable.plugins || {};
Handsontable.plugins.ContextMenu = ContextMenu;
