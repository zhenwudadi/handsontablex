/**
 * Cell type is just a shortcut for setting bunch of cellProperties (used in getCellMeta)
 */

Handsontable.AutocompleteCell = {
  renderer: Handsontable.AutocompleteRenderer,
  editor: Handsontable.AutocompleteEditor
};

Handsontable.CheckboxCell = {
  renderer: Handsontable.CheckboxRenderer,
  editor: Handsontable.CheckboxEditor
};

Handsontable.TextCell = {
  renderer: Handsontable.TextRenderer,
  editor: Handsontable.TextEditor
};

Handsontable.NumericCell = {
  renderer: Handsontable.NumericRenderer,
  editor: Handsontable.TextEditor,
  dataType: 'number'
};

Handsontable.DateCell = {
  renderer: Handsontable.AutocompleteRenderer, //displays small gray arrow on right side of the cell
  editor: Handsontable.DateEditor
};

Handsontable.HandsontableCell = {
  renderer: Handsontable.AutocompleteRenderer, //displays small gray arrow on right side of the cell
  editor: Handsontable.HandsontableEditor
};

//here setup the friendly aliases that are used by cellProperties.type
Handsontable.cellTypes = {
  autocomplete: Handsontable.AutocompleteCell,
  checkbox: Handsontable.CheckboxCell,
  text: Handsontable.TextCell,
  numeric: Handsontable.NumericCell,
  date: Handsontable.DateCell,
  handsontable: Handsontable.HandsontableCell
};

//here setup the friendly aliases that are used by cellProperties.renderer and cellProperties.editor
Handsontable.cellLookup = {
  renderer: {
    autocomplete: Handsontable.AutocompleteRenderer,
    checkbox: Handsontable.CheckboxRenderer,
    text: Handsontable.TextRenderer,
    numeric: Handsontable.NumericRenderer
  },
  editor: {
    autocomplete: Handsontable.AutocompleteEditor,
    checkbox: Handsontable.CheckboxEditor,
    text: Handsontable.TextEditor,
    date: Handsontable.DateEditor,
    handsontable: Handsontable.HandsontableEditor
  }
};