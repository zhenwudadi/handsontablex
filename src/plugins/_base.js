
import {defineGetter} from './../helpers.js';

class BasePlugin {
  /**
   * @param {Object} hotInstance Handsontable instance
   */
  constructor(hotInstance) {
    defineGetter(this, 'hot', hotInstance, {
      writable: false
    });
  }

  /**
   * Destroy plugin
   */
  destroy() {
    delete this.hot;
  }
}

export default BasePlugin;
