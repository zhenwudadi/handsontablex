# Handsontable

Handsontable is a minimalistic approach to Excel-like table editor in HTML & jQuery. Requires jQuery 1.7+. Runs in IE7, IE8, IE9, Firefox, Chrome, Safari and Opera.

See the demos at http://warpech.github.com/jquery-handsontable/ or fork the example on [JSFiddle](http://jsfiddle.net/warpech/hU6Kz/).

## Usage

First, include all the dependencies:

```html
<script src="lib/jquery.min.js"></script>
<script src="jquery.handsontable.js"></script>
<script src="lib/bootstrap-typeahead.js"></script><!-- if you need the autocomplete feature -->
<script src="lib/jquery.autoresize.js"></script><!-- if you need the autoexpanding textarea -->
<script src="lib/jQuery-contextMenu/jquery.contextMenu.js"></script><!-- if you need the context menu -->
<script src="lib/jQuery-contextMenu/jquery.ui.position.js"></script><!-- if you need the context menu -->
<link rel="stylesheet" media="screen" href="lib/jQuery-contextMenu/jquery.contextMenu.css">
<link rel="stylesheet" media="screen" href="jquery.handsontable.css">
```

Then, run `handsontable()` constructor on an empty div. After that, load some data if you wish:

```html
<div id="dataTable" class="dataTable"></div>
<script>
  $("#dataTable").handsontable({
    rows: 6,
    cols: 8
  });
  var data = [
    ["", "Kia", "Nissan", "Toyota", "Honda"],
    ["2008", 10, 11, 12, 13],
    ["2009", 20, 11, 14, 13],
    ["2010", 30, 15, 12, 13]
  ];
  $("#dataTable").handsontable("loadData", data);
</script>
```

## Changelog

To see the list of recent changes, see the [Changelog](https://github.com/warpech/jquery-handsontable/wiki/Changelog) wiki page.

## Methods

  Option                                                                               | Role        | Description
---------------------------------------------------------------------------------------|-------------|-------------
 handsontable(options)                                                                 | Constructor | Accepts configuration object (see **Options**)
 handsontable('updateSettings', options)                                               | Method      | Use it if you need to change configuration after initialization
 handsontable('refreshLegend', [row, col])                                             | Method      | If you redefine legend in `updateSettings`, new legend is not applied immediately. To force reapplying new legend rules, run `refreshLegend` method. Params `row`, `col` are optional
 handsontable('loadData', data, [allowHtml=false])                                     | Method      | Reset all cells in the grid to contain data from the `data` array. Any HTML in `data` is escaped unless you set `allowHtml` to true
 handsontable('setDataAtCell',&nbsp;row,&nbsp;col,&nbsp;value,&nbsp;[allowHtml=false]) | Method      | Set new value to a cell. Any HTML in `value` is escaped unless you set `allowHtml` to true. To change many cells at once, pass an array of changes in format [[row, col, value, allowHtml], ...] as the only parameter.
 handsontable('getDataAtCell', row, col)                                               | Method      | Returns value corresponding to cell at `row`, `col`
 handsontable('clear')                                                                 | Method      | Empty all cells
 handsontable('clearUndo')                                                             | Method      | Clear undo history
 handsontable('getData', [asReference=false])                                          | Method      | Returns 2-dimensional array with a copy of the current grid data. Optionally, set param `asReference` to true, to return the internal data array as reference. That is faster but should be used only to READ data (otherwise you will mess up the DOM table). To write data, you should always use method `setDataAtCell`.
 handsontable('alter', 'insert_row', index)                                            | Method      | Insert new row above the row at given index
 handsontable('alter', 'insert_col', index)                                            | Method      | Insert new column before the column at given index
 handsontable('alter',&nbsp;'remove_row',&nbsp;index,&nbsp;[toIndex])                  | Method      | Remove the row at given index [optionally to another index]
 handsontable('alter',&nbsp;'remove_col',&nbsp;index,&nbsp;[toIndex])                  | Method      | Remove the column at given index [optionally to another index]
 handsontable('getCell', row, col)                                                     | Method      | Return &lt;td&gt; element for given `row,col`
 handsontable('getCellMeta', row, col)                                                 | Method      | Return meta data for given `row,col`. Currently has one property: isWritable (Boolean)
 handsontable('selectCell', r, c, [r2, c2, scrollToSelection=true])                    | Method      | Select cell `r,c` or range finishing at `r2,c2`. By default, viewport will be scrolled to selection
 handsontable('deselectCell')                                                          | Method      | Deselect current selection
 handsontable('getSelected')                                                           | Method      | Return index of the currently selected cells as an array [`topLeftRow`, `topLeftCol`, `bottomRightRow`, `bottomRightCol`]
 handsontable('getRowHeader', [row])                                                   | Method      | Return array of row headers (if they are enabled). If param `row` given, return header at given row as string
 handsontable('getColHeader', [col])                                                   | Method      | Return array of col headers (if they are enabled). If param `col` given, return header at given col as string
 handsontable('setCellReadOnly', row, col)                                             | Method      | Sets cell to be readonly
 handsontable('setCellEditable', row, col)                                             | Method      | Sets cell to be editable (removes readonly)

## Options

The table below presents configuration options that are interpreted by `handsontable()` constructor:

  Option                 | Type                           | Default          | Description
-------------------------|--------------------------------|------------------|-------------
 `rows`                  | number                         | 5                | Initial number of rows
 `cols`                  | number                         | 5                | Initial number of columns
 `rowHeaders`            | boolean/array                  | false            | Defines if the row headers (1, 2, 3, ...) should be displayed. You can just set it to `true` or specify custom a array `["First", "Second", "Third", ...]`
 `colHeaders`            | boolean/array                  | false            | Defines if the column headers (A, B, C, ...) should be displayed. You can just set it to `true` or specify custom a array `["First Name", "Last Name", "Address", ...]`
 `minWidth`              | number                         | 0                | Handsontable will add as many columns as needed to meet the given width in pixels
 `minHeight`             | number                         | 0                | Handsontable will add as many rows as needed to meet the given height in pixels
 `minSpareCols`          | number                         | 0                | When set to 1 (or more), Handsontable will add a new column at the end of grid if there are no more empty columns
 `minSpareRows`          | number                         | 0                | When set to 1 (or more), Handsontable will add a new row at the end of grid if there are no more empty rows
 `multiSelect`           | boolean                        | true             | If true, selection of multiple cells using keyboard or mouse is allowed
 `fillHandle`            | boolean/string                 | true             | Defines if the fill handle (drag-down and copy-down) functionality should be enabled. Possible values: `true` (to enable in all directions), `"vertical"` or `"horizontal"` (to enable in one direction), `false` (to disable completely).
 `contextMenu`           | boolean/array                  | false            | Defines if the right-click context menu should be enabled. Context menu allows to create new row or column at any place in the grid. Possible values: `true` (to enable basic options), `false` (to disable completely) or array of available strings: `row_above`, `row_below`, `col_left`, `col_right`, `remove_row`, `remove_col`, `undo`, `redo`, `sep1`, `sep2`, `sep3`.
 `undo`                  | boolean                        | true             | If true, undo/redo functionality is enabled
 `outsideClickDeselects` | boolean                        | true             | If true, mouse click outside the grid will deselect the current selection
 `enterBeginsEditing`    | boolean                        | true             | If true, ENTER begins editing mode (like Google Docs). If false, ENTER moves to next row (like Excel) and adds new row if necessary. TAB adds new column if necessary.
 `enterMoves`            | object                         | {row: 1, col: 0} | Defines cursor move after Enter is pressed (Shift+Enter uses negative vector)
 `tabMoves`              | object                         | {row: 0, col: 1} | Defines cursor move after Tab is pressed (Shift+Tab uses negative vector)
 `autoWrapRow`           | boolean                        | false            | If true, pressing TAB or right arrow in the last column will move to first column in next row
 `autoWrapCol`           | boolean                        | false            | If true, pressing ENTER or down arrow in the last row will move to first row in next column
 `legend`                | array                          | _undefined_      | Legend definitions. See **Defining legend**
 `autocomplete`          | array                          | _undefined_      | Autocomplete definitions. See **Defining autocomplete**
 `onSelection`           | function(`r`, `c`, `r2`, `c2`) | _undefined_      | Callback fired before one or more cells is selected. You can call `updateSettings` from inside, e.g. if you want to disable fillHandle for a specific cell. Parameters: <ul><li>`r` selection start row</li><li>`c` selection start column</li><li>`r2` selection end column</li><li>`c2` selection end column</li></ul>
 `onBeforeChange`        | function(`changes`)            | _undefined_      | Callback fired before one or more cells is changed. Its main purpose is to validate the input. Parameters: <ul><li>`changes` is a 2D array containing information about each of the edited cells `[ [row, col, oldVal, newVal], ... ]`. You can disregard a single change by setting `changes[i][3]` to false, or cancel all edit by returning false.</li></ul>
 `onChange`              | function(`changes`, `source`)  | _undefined_      | Callback fired after one or more cells is changed. Its main use case is to save the input. Parameters: <ul><li>`changes` is a 2D array containing information about each of the edited cells `[ [row, col, oldVal, newVal], ... ]`. </li><li>`source` is one of the strings: `"alter"`, `"empty"`, `"edit"`, `"populateFromArray"`, `"loadData"`, `"autofill"`, `"paste"`.</li></ul>

### Defining legend

The `legend` option is an array of mixins that define multiple legends for the grid. 

With your imagination, legend can be used to make any of the grid cells read-only, use different 
text color, or show a tooltip (title) when hovered with mouse cursor.

Example:

```js
legend: [
  {
    match: function (row, col, data) {
      return (row === 0); //if it is first row
    },
    style: {
      color: '#666', //make the text gray and bold
      fontWeight: 'bold'
    },
    title: 'Heading', //make some tooltip
    readOnly: true, //make it read-only
    icon: {
      src: "/calendar.png", // url to icon (16 x 16)
      click: initCalendar // function to call when the icon is clicked
    }
  }
```

### Defining autocomplete

The `autocomplete` option is an array of mixins that define multiple autocomplete providers for the grid. 

To keep Handsontable lightweight, this feature has a dependency on another jQuery plugin: 
[bootstrap-typeahead](https://github.com/twitter/bootstrap/blob/master/js/bootstrap-typeahead.js). 
It is included in the repo.

Example:

```js
autoComplete: [
  {
    match: function (row, col, data) {
      if (data()[0][col].indexOf("color") > -1) { //if column name contains word "color"
        return true;
      }
      return false;
    },
    highlighter: function (item) {
      //only define this function if you want a different behavior
      //than the original (defaultAutoCompleteHighlighter in core.js)
      var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
      var label = item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
        return '<strong>' + match + '</strong>';
      });
      return '<span style="margin-right: 10px; background-color: ' + item + '">&nbsp;&nbsp;&nbsp;</span>' + label;
    },
    source: function (row, col) {
      return ["yellow", "red", "orange", "green", "blue", "gray", "black", "white"]
    },
    strict: false //allows other values that defined in array above
  },
  {
    match: function (row, col, data) {
      return (col === 0); //if it is first column
    },
    source: function (row, col) {
      return ["BMW", "Chrysler", "Nissan", "Suzuki", "Toyota", "Volvo"]
    },
    strict: true //only accept predefined values (from array above)
  }
],
```

## Similar projects

If you are interested in more complicated data grid solutions, consider:
 - [DataTables](http://datatables.net/)
 - [SlickGrid](https://github.com/mleibman/SlickGrid)

## License 

(The MIT License)

Copyright (c) 2012 Marcin Warpechowski &lt;marcin@nextgen.pl&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.