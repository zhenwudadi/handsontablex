## [0.8.5](https://github.com/warpech/jquery-handsontable/tree/v0.8.5) (Feb 18, 2013)

Bugfix:
- clear currentRowClassName and currentColumnClassName when refreshing selections ([#398](https://github.com/warpech/jquery-handsontable/issues/398), [8df5de9](https://github.com/warpech/jquery-handsontable/commit/8df5de9a345a650a8e588bc4fe3da5d3e2075972)) - thanks @jaycfields

## [0.8.4](https://github.com/warpech/jquery-handsontable/tree/v0.8.4) (Feb 17, 2013)

Features:
- add $.browser shim for compatibility with jQuery 1.9 ([#378](https://github.com/warpech/jquery-handsontable/issues/378), [#389](https://github.com/warpech/jquery-handsontable/issues/389), [13d72c8](https://github.com/warpech/jquery-handsontable/commit/13d72c8cb10f733e1149f71f156a6c6a4f8cb3dc))

Other:
- add jQuery Plugins Registry manifest file

## [0.8.3](https://github.com/warpech/jquery-handsontable/tree/v0.8.3) (Jan 23, 2013)

Features:
- optimize jquery-autoresize plugin: arclones element is emptied before injecting another node
- new configuration options `currentRowClassName` and `currentColClassName` along with new example page [Highlight current row & column](http://handsontable.com/demo/current.html) [TODO: write tests]
- [Manual column resize](http://handsontable.com/demo/column_resize.html)
- [Column sorting](http://handsontable.com/demo/sorting.html)
- compability: automatic column size is asserted `true` when `colWidths` option is not provided
- apply automatic column size when double clicked on manual resize handle [TODO: write tests]
- Scroll example page describes difference between available [column stretching modes](http://handsontable.com/demo/scroll.html) (all, last [default], none)
- manual column move

Breaking changes:
- `loadData` no longer sends list of changes to `onChange` callback. That was not performant. Now if sends `null` changes object and `loadData` as source string.

Bugfixes:
- overflow auto only worked when declared in inline style (not in CSS class) (issue #339 point 6)
- during initialization, sliders were shown for a while in the top left corner
- scrolling issues (#343, #331, partially #360)
- deselection when param `outsideClickDeselects` set to true (issue #351)
- order of callbacks when clicked outside of a cell (issue #269)
- context menu was shown when clicked outside of the table (issue #306)

## [0.8.2](https://github.com/warpech/jquery-handsontable/tree/v0.8.2) (Jan 7, 2013)

Features:
- new options `copyRowsLimit`, `copyColsLimit` and callback `onCopyLimit`. The options configure the amount of rows and columns that can be copied to clipboard (default 1000). The callback will ba called if the limit is exceeded (response to an issue first reported by @itanex / #295)
- performance fixes for selecting all cells (CTRL+A)
- auto width [TODO: write more]
- auto stretch [TODO: write more]

Bugfix:
- `selectCells` did not perform multiple selection when given 4 parameters

## [0.8.1](https://github.com/warpech/jquery-handsontable/tree/v0.8.1) (Jan 6, 2013)

Bugfixes:
- fixed error when loading a new data source with fewer rows/columns
- using `minCols` with `columns` option caused an infinite loop. Now `columns` length sets a fixed number of columns (options `startCols`, `minCols`, `maxCols` will be ignored when `columns` is set) (fix #334)
- onChange was triggered before data was rendered (fix #333)
- public `destroy` method did not unbind Handsontable events (fix #335)
- fix error when data row was externally removed while scrolling

Other changes:
- [Custom HTML demo page](http://handsontable.com/demo/renderers_html.html) (Rendering custom HTML in header) did not work well
- JSFiddle links now also work in [Context Menu demo page](http://handsontable.com/demo/contextmenu.html)
- tests are now passing 100% in Chrome, FF, IE9 and Opera. Tests are 99% passing in IE7-8, but remaining 1% does not affect normal operation in these browsers

## [0.8.0](https://github.com/warpech/jquery-handsontable/tree/v0.8.0) (Jan 2, 2013)

After series of bugfixes in last 3 beta version, this is the first stable release in 0.8.x branch. From now on, I will try to update critical issues more frequently.

New features since 0.8.0-beta3:
- new methods `rowOffset`, `colOffset`, `countVisibleRows`, `countVisibleCols`
- new callback `onCreateRow` [TODO: write tests]
- `dataSchema` can now be a function that returns object/array [TODO: write tests]
- when using `overflow: auto`, only relevant scrollbars should be displayed (first reported by @dansabirov / #295)
- fixed scrolling with arrow keys
- column title can be given as `columns[].title` (not only colHeaders[]) [TODO: write tests]
- column width can be given as `columns[].width` (not only colWidths[]) [TODO: write tests]
- column type can be set using simple strings: `autocomplete`, `checkbox`

Other changes:
- public methods `colCount`, `rowCount` are removed. Use `countRows()` and `countCols()` public methods instead
- public methods `setCellReadOnly`, `setCellEditable` are removed. Use `readOnly` cell property to make a cell read-only. See `demo/readonly.html` for examples
- options `minWidth`, `minHeight` are removed. Their definitions were to blurry and usage case too limited. Use `width` and `height` options instead and provide as many rows/columns in your data source as you need
- add `render` method to README.md

Bugfixes since 0.8.0-beta3:
- enter on last row/col should add more rows/cols if minSpareRows/minSpareCols > 0
- double clicking on fill handle fills the column to the last non-empty row
- pressing enter/tab in autocomplete moves to next row/column
- CTRL+A works slow on large data sets (as reported by @brivazac / #295)
- CTRL+A, CTRL+C sequence did not work well if CTRL was not released
- page up/page down worked wrongly

Known issues:
- clicking on cell & row borders has no effect (first reported by @cscribner / #295)
- copy of large selection (5k, 10k, 100k rows etc) freezes IE8 (first reported by @itanex / #295). Below 1k rows works fine. The only solution I can think of right now is to set copy limit in IE8 to 1000 rows.
- paste of large selection (100k rows) freezes Firefox (first reported by @ravio / #303)
- autocomplete does not work with empty field in source; autocomplete strict mode looks broken (as reported by @MDron / #303)
- scrolling mouse wheel/page up/page down should not block the window scroll if the first row/last row was reached
- page up/page down does not behave exactly as in Google Docs (moves selected cell to first visible row). This is because transformStart implies scrollToCell. It should be decoupled sometime in future

## [0.8.0-beta3](https://github.com/warpech/jquery-handsontable/tree/v0.8.0-beta3) (Dec 18, 2012)

Beta preview has been updated: http://handsontable.com/0.8.0/

Bugfixes since 0.8.0-beta2:
- fixed scrolling with touchpad (as reported by @codename- / #303)
- fixed double click on cell (as reported by @MDron, @ravio / #303)
- CTRL+A then Delete did not remove redundant empty rows in scroll example (as reported by @ravio / 303)
- fill handle (drag-down) feature is currently broken (as reported by @chaowarat / 301)
- CTRL+Enter while editing multiselection did not work (should apply the value to all the selected cells)
- now works in IE7

Other changes since 0.8.0-beta2:
- removed `jquery.ui.position.js` from `jquery.handsontable.full.js`, because it seems to have no effect (explained in `demo/contextmenu.html`)

## [0.8.0-beta2](https://github.com/warpech/jquery-handsontable/tree/v0.8.0-beta2) (Dec 14, 2012)

Beta preview has been updated: http://handsontable.com/0.8.0/

New features since 0.8.0-beta1:
- now the table is rendered even faster with `requestAnimationFrame`

Bugfixes since 0.8.0-beta1:
- fixed known issue "selecting an area and clicking one of its cells within 500 ms starts editing of that cell"
- fixed known issue "table width and height is now configured using `width` and `height` settings"
- fixed error when clicking on row/column header (related to @cscribner / #295)
- fix copy-paste in Chrome (thanks @ravio  / #295)
- `getRowHeader()` referenced to colHeaders instead of rowHeaders (thanks @marint / #295)
- fix performance of `loadData` (thanks @codename- / #295)
- now works in IE8, still not yet in IE7

## [0.8.0-beta1](https://github.com/warpech/jquery-handsontable/tree/v0.8.0-beta1) (Dec 11, 2012)

Beta of new upcoming version 0.8.0 can be previewed here: http://handsontable.com/0.8.0/

Features:
- completely new rendering engine codenamed "Walkontable" that uses a `canvas` type approach to draw the visible part of the table on screen. Works smoothly even with data sources above 100 000k rows.

Bugfixes:
- fixed CSS problems with Foundation framework

Other changes:
- Handsontable core properties `colCount`, `rowCount` do not exist anymore. Use `countRows()` and `countCols()` public methods instead

## [0.7.5](https://github.com/warpech/jquery-handsontable/tree/v0.7.5) (Nov 26, 2012)

Features:

- new settings: `minRows`, `minCols`, `maxRows`, `maxCols` (fixes [#225](https://github.com/warpech/jquery-handsontable/issues/225))
- `startRows` and `startCols` should now be only used to define how many empty rows should be created on grid initialization
- now you can use `columns` to configure number of autocomplete items (fixes [#242](https://github.com/warpech/jquery-handsontable/issues/242))

Bugfixes:

- `loadData` now will remove empty rows from grid if new data source has less rows
- new rows are now correctly created when using nested object data source ([#255](https://github.com/warpech/jquery-handsontable/pull/255))
- copy and paste issues with nested object data source ([#250](https://github.com/warpech/jquery-handsontable/issues/250))

## [0.7.4](https://github.com/warpech/jquery-handsontable/tree/v0.7.4) (Nov 19, 2012)

Bugfixes:

- fix error when pasting values to a grid with dataSchema (issue #237)
- loadData should remove empty row if source data has more empty rows than allowed by minSpareRows (issue #239)
- textarea dimensions were not updated if grid was rerendered while editing

## [0.7.3](https://github.com/warpech/jquery-handsontable/tree/v0.7.3) (Nov 14, 2012)

Features:

- big news: build now contains full and minified JS and CSS packages. See [dist/](https://github.com/warpech/jquery-handsontable/tree/master/dist) directory for details.
- added experimental "Edit in jsFiddle" link in [autocomplete example](http://handsontable.com/demo/autocomplete.html). If no issues are observed, I will add it to all example pages.

Bugfixes:

- fixed [issue with setCellReadOnly](http://stackoverflow.com/questions/13127501/sets-cell-to-be-readonly) that was reported on Stack Overflow.
- fixed performance issue with cells being rendered twice in `loadData` (issue #233)

## [0.7.2](https://github.com/warpech/jquery-handsontable/tree/v0.7.2) (Nov 12, 2012)

Fixes exeption when editing cell in IE8 (issue #232) and problems when using Autocomplete with Ajax.

Added Ajax example on [autocomplete.html](handsontable.com/demo/autocomplete.html)

## [0.7.1](https://github.com/warpech/jquery-handsontable/tree/v0.7.1) (Nov 9, 2012)

Mosty fixes for the Autocomplete feature as well as a new (easier) syntax for the Autocompelte. See [autocomplete.html](http://handsontable.com/demo/autocomplete.html) for examples. Old syntax should still work due to the [legacy layer](https://github.com/warpech/jquery-handsontable/blob/master/src/plugins/legacy.js).

Features (described in [README.md](https://github.com/warpech/jquery-handsontable)):

  - new public method `destroyEditor` (#229). 

## [0.7.0](https://github.com/warpech/jquery-handsontable/tree/v0.7.0) (Nov 5, 2012)

Please note that this release has partial incompability with previous releases. It is step in a direction to make Handsontable more flexible and customisable.

Adds binding to object data source (prior versions only allow 2-dimensional array data source)  
Adds selective column rendering (using `columns` option)
Now data is assigned to Handsontable as reference (prior versions had data copied)
Adds custom cell types (currently text, autocomplete or checkbox)

Features removed:

 - Legend (use [cell renderers](http://handsontable.com/demo/renderers.html) instead)

## [0.6.0](https://github.com/warpech/jquery-handsontable/tree/v0.6.0) (Sep 27, 2012)

Please note that this release has partial incompability with previous releases, though it should affect only border cases.

Potential incompabilities with version 0.5.1:
  - public method `getData` no longer has `asReference` parameter (use `getDataReference` instead)
  - to have scrollable grid, you must set "overflow: scroll" or "overflow: auto" directly on Handsontable container. Until now, it worked also when you set overflow scroll/auto on any of the container parents, but that turned out to be not compatible with Twitter Bootstrap

Features added in 0.6.0 (described in [README.md](https://github.com/warpech/jquery-handsontable)):
  - virtual scrolling that solves problem with row/column header flicker in IE and FF when the grids quickly scrolled
  - public method `getData` now accepts optional arguments to return only fragment of grid data (e.g. current selection)
  - new public method `getDataReference` works the same as `getData` but returns data as reference, which is faster but can mess up if manipulated outside the plugin

Bugfixes:
  - keyword `this` in onChange, onBeforeChange, onSelection callbacks points to container HTML element
  - editing a field in Firefox 3.6.28 skipped the first character
  - added default font-family and font-size for .typeahead
  - TAB does not move cell selection if cell is not being edited (#151)
  - HTML special chars should be preserved in data map but escaped in DOM (#147)
  - rowHeaders/colHeaders false should not init row/col headers (#141)
  - legend icon did not resize column header

## [0.5.1](https://github.com/warpech/jquery-handsontable/tree/v0.5.1) (Sep 7, 2012)

- features (described in [README.md](https://github.com/warpech/jquery-handsontable)):
  - allow icons in Legends (see [example](http://warpech.github.com/jquery-handsontable/#example2))
  - new public method `refreshLegend`
  - new configuration option `outsideClickDeselects`
  - added data function reference in autocomplete match (`match: function (row, col, data)`)
- bugfix:
  - option `fillHandle: 'horizontal'` and `'vertical'` did not work 

## [0.5.0](https://github.com/warpech/jquery-handsontable/tree/v0.5.0) (Aug 15, 2012)

- features (described in [README.md](https://github.com/warpech/jquery-handsontable)):
  - public methods `getDataAtCell`, `setCellReadOnly` - thanks @Dinesh-Ramakrishnan
  - public methods `getSelected` - thanks @littley!
  - public methods `getRowHeader`, `getColHeader`, `getCellMeta`
  - configuration `autoWrapRow`, `autoWrapCol`, `enterBeginsEditing`
  - now Enter key behaves more like in Excel (see issue #56)
- code quality:
  - add `"use strict";` (ECMAScript strict mode) to all components
  - allow to run in jQuery noConflict mode
  - namespace was changed from `handsontable` to `Handsontable` to avoid var name conflicts that people were having by accident
  - now code is divided into components and built with [Grunt](http://weblog.bocoup.com/introducing-grunt/)
- tests: added four Selenium IDE tests to automate testing of bugfixes. This is a start - more tests will be added in future versions. Tests are located in [test/](https://github.com/warpech/jquery-handsontable/tree/master/test) directory.
- 75 bugfixes

## [0.4.2](https://github.com/warpech/jquery-handsontable/tree/v0.4.2) (Jun 18, 2012)

- features:
  - row and column headers (options: `rowHeaders`, `colHeaders`)
  - public methods `selectCell`, `deselectCell`

## [0.4.1](https://github.com/warpech/jquery-handsontable/tree/v0.4.1) (Jun 15, 2012)

- feature: public methods `setDataAtCell`, `loadData` now have a new parameter `allowHtml` that will omit escaping of HTML code

## [0.4.0](https://github.com/warpech/jquery-handsontable/tree/v0.4.0) (Jun 04, 2012)

- first version number to be documented here
- feature: undo/redo
