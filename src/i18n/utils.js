import {isUndefined} from './../helpers/mixed';
import {objectEach} from './../helpers/object';

/**
 * Perform shallow extend of a target object with only this extension's properties which doesn't exist in the target.
 *
 * @param {Object} target An object that will receive the new properties.
 * @param {Object} extension An object containing additional properties to merge into the target.
 */
// TODO: Maybe it should be moved to global helpers? It's changed `extend` function.
export function extendNotExistingKeys(target, extension) {
  objectEach(extension, (value, key) => {
    if (isUndefined(target[key])) {
      target[key] = value;
    }
  });

  return target;
}

/**
 * Create range of values basing on cell indexes. For example, it will create below ranges for specified function arguments:
 *
 * createCellHeadersRange(2, 7) => `2-7`
 * createCellHeadersRange(7, 2) => `2-7`
 * createCellHeadersRange(0, 4, 'A', 'D') => `A-D`
 * createCellHeadersRange(4, 0, 'D', 'A') => `A-D`
 *
 * @param {number} firstRowIndex Index of "first" cell
 * @param {number} secondRowIndex Index of "second" cell
 * @param {*} fromValue Value which will represent "first" cell
 * @param {*} toValue Value which will represent "second" cell
 * @returns {string} Value representing range i.e. A-Z, 11-15.
 */
export function createCellHeadersRange(firstRowIndex, secondRowIndex, fromValue = firstRowIndex, toValue = secondRowIndex) {
  // Will swap `fromValue` with `toValue` if it's necessary.
  if (firstRowIndex > secondRowIndex) {
    [fromValue, toValue] = [toValue, fromValue];
  }

  return `${fromValue}-${toValue}`;
}
