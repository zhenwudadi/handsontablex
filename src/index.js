import Core from './core';

function Handsontable(rootElement, userSettings) {
  let instance = new Core(rootElement, userSettings || {});

  instance.init();

  return instance;
}

Handsontable.Core = Core;

import './css/handsontable.css';
import './css/mobile.handsontable.css';

import './renderers/_cellDecorator';
import './../plugins/jqueryHandsontable';
import {getListenersCounter} from './eventManager';

Handsontable.getListenersCounter = getListenersCounter;

// Handsontable.buildDate = __HOT_BUILD_DATE__;
// Handsontable.packageName = __HOT_PACKAGE_NAME__;
// Handsontable.version = __HOT_VERSION__;
//
// let baseVersion = __HOT_BASE_VERSION__;
//
// if (baseVersion) {
//   Handsontable.baseVersion = baseVersion;
// }

// Export Hooks singleton
import Hooks from './pluginHooks';

Handsontable.hooks = Hooks.getSingleton();

// TODO: Remove this exports after rewrite tests about this module
import GhostTable from './utils/ghostTable';

Handsontable.__GhostTable = GhostTable;
//

// Export all helpers to the Handsontable object
import * as arrayHelpers from './helpers/array';
import * as browserHelpers from './helpers/browser';
import * as dataHelpers from './helpers/data';
import * as dateHelpers from './helpers/date';
import * as featureHelpers from './helpers/feature';
import * as functionHelpers from './helpers/function';
import * as mixedHelpers from './helpers/mixed';
import * as numberHelpers from './helpers/number';
import * as objectHelpers from './helpers/object';
import * as settingHelpers from './helpers/setting';
import * as stringHelpers from './helpers/string';
import * as unicodeHelpers from './helpers/unicode';
import * as domHelpers from './helpers/dom/element';
import * as domEventHelpers from './helpers/dom/event';

const HELPERS = [
  arrayHelpers,
  browserHelpers,
  dataHelpers,
  dateHelpers,
  featureHelpers,
  functionHelpers,
  mixedHelpers,
  numberHelpers,
  objectHelpers,
  settingHelpers,
  stringHelpers,
  unicodeHelpers,
];
const DOM = [
  domHelpers,
  domEventHelpers,
];

Handsontable.helper = {};
Handsontable.dom = {};
// Legacy support.
Handsontable.Dom = Handsontable.dom;

// Fill general helpers.
arrayHelpers.arrayEach(HELPERS, (helper) => {
  arrayHelpers.arrayEach(Object.getOwnPropertyNames(helper), (key) => {
    if (key.charAt(0) !== '_') {
      Handsontable.helper[key] = helper[key];
    }
  });
});

// Fill DOM helpers.
arrayHelpers.arrayEach(DOM, (helper) => {
  arrayHelpers.arrayEach(Object.getOwnPropertyNames(helper), (key) => {
    if (key.charAt(0) !== '_') {
      Handsontable.dom[key] = helper[key];
    }
  });
});

// Export cell types.
import cellTypes from './cellTypes';

Handsontable.cellTypes = {};

arrayHelpers.arrayEach(Object.getOwnPropertyNames(cellTypes), (key) => {
  Handsontable.cellTypes[key] = cellTypes[key];
});

// Export all editors to the Handsontable object.
import {getRegisteredEditorNames, registerEditor, getEditor, getEditorConstructor} from './editors';

Handsontable.editors = {};

arrayHelpers.arrayEach(getRegisteredEditorNames(), (editorName) => {
  Handsontable.editors[`${stringHelpers.toUpperCaseFirst(editorName)}Editor`] = getEditorConstructor(editorName);
});

Handsontable.editors.registerEditor = registerEditor;
Handsontable.editors.getEditor = getEditor;

// Export all renderers to the Handsontable object.
import {getRegisteredRendererNames, getRenderer, registerRenderer} from './renderers';

Handsontable.renderers = {};

arrayHelpers.arrayEach(getRegisteredRendererNames(), (rendererName) => {
  const renderer = getRenderer(rendererName);

  if (rendererName === 'base') {
    Handsontable.renderers.cellDecorator = renderer;
  }
  Handsontable.renderers[`${stringHelpers.toUpperCaseFirst(rendererName)}Renderer`] = renderer;
});

Handsontable.renderers.registerRenderer = registerRenderer;
Handsontable.renderers.getRenderer = getRenderer;

// Export all plugins to the Handsontable object.
import * as plugins from './plugins/index'; // <---- TODO: Move plugins to webpack as import from external
import {registerPlugin} from './plugins';

Handsontable.plugins = {};

arrayHelpers.arrayEach(Object.getOwnPropertyNames(plugins), (pluginName) => {
  const plugin = plugins[pluginName];

  if (pluginName === 'Base') {
    Handsontable.plugins[`${pluginName}Plugin`] = plugin;
  } else {
    Handsontable.plugins[pluginName] = plugin;
  }
});

Handsontable.plugins.registerPlugin = registerPlugin;

// Export Handsontable
module.exports = Handsontable;
