describe('Core_getCellMeta', function () {
  var id = 'testContainer';

  beforeEach(function () {
    this.$container = $('<div id="' + id + '"></div>').appendTo('body');
  });

  afterEach(function () {
    if (this.$container) {
      this.$container.remove();
    }
  });

  it('should not allow manual editing of a read only cell', function () {
    var allCellsReadOnly = false;

    handsontable({
      cells: function () {
        return {readOnly: allCellsReadOnly}
      }
    });
    allCellsReadOnly = true;
    selectCell(2, 2);

    waitsFor(nextFrame, 'next frame', 60);

    runs(function () {
      keyDown('enter');
    });

    waitsFor(nextFrame, 'next frame', 60);

    runs(function () {
      expect(isEditorVisible()).toEqual(false);
    });
  });

  it('should allow manual editing of cell that is no longer read only', function () {
    var allCellsReadOnly = true;

    handsontable({
      cells: function () {
        return {readOnly: allCellsReadOnly}
      }
    });
    allCellsReadOnly = false;
    selectCell(2, 2);

    waitsFor(nextFrame, 'next frame', 60);

    runs(function () {
      keyDown('enter');
    });

    waitsFor(nextFrame, 'next frame', 60);

    runs(function () {
      expect(isEditorVisible()).toEqual(true);
    });
  });
});