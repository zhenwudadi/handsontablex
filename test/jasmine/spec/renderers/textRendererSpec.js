describe('TextRenderer', function () {
  var id = 'testContainer';

  beforeEach(function () {
    this.$container = $('<div id="' + id + '"></div>').appendTo('body');
  });

  afterEach(function () {
    if (this.$container) {
      this.$container.remove();
    }
  });

  it('should render string', function () {
    handsontable();
    setDataAtCell(2, 2, "string");

    waitsFor(nextFrame, 'next frame', 60);

    runs(function () {
      expect(getCell(2, 2).innerHTML).toEqual("string");
    });
  });

  it('should render number', function () {
    handsontable();
    setDataAtCell(2, 2, 13);

    waitsFor(nextFrame, 'next frame', 60);

    runs(function () {
      expect(getCell(2, 2).innerHTML).toEqual("13");
    });
  });

  it('should render boolean true', function () {
    handsontable();
    setDataAtCell(2, 2, true);

    waitsFor(nextFrame, 'next frame', 60);

    runs(function () {
      expect(getCell(2, 2).innerHTML).toEqual("true");
    });
  });

  it('should render boolean false', function () {
    handsontable();
    setDataAtCell(2, 2, false);

    waitsFor(nextFrame, 'next frame', 60);

    runs(function () {
      expect(getCell(2, 2).innerHTML).toEqual("false");
    });
  });

  it('should render null', function () {
    handsontable();
    setDataAtCell(2, 2, null);

    waitsFor(nextFrame, 'next frame', 60);

    runs(function () {
      expect(getCell(2, 2).innerHTML).toEqual("");
    });
  });

  it('should render undefined', function () {
    handsontable();
    setDataAtCell(2, 2, (function () {
    })());

    waitsFor(nextFrame, 'next frame', 60);

    runs(function () {
      expect(getCell(2, 2).innerHTML).toEqual("");
    });
  });
});