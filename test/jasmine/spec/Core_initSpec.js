describe('Core_init', function () {
  var id = 'testContainer';

  beforeEach(function () {
    this.$container = $('<div id="' + id + '"></div>').appendTo('body');
  });

  afterEach(function () {
    if (this.$container) {
      this.$container.remove();
    }
  });

  it('should respect startRows and startCols when no data is provided', function () {
    this.$container = $('<div id="' + id + '"></div>').appendTo('body');
    handsontable();

    waitsFor(nextFrame, 'next frame', 60);

    runs(function () {
      expect(countRows()).toEqual(5); //as given in README.md
      expect(countCols()).toEqual(5); //as given in README.md
    });
  });

  it('should respect width provided in inline style', function () {
    this.$container.css({
      overflow: 'auto',
      width: '200px'
    });
    handsontable({
      data: [
        ["ABC", "ABC", "ABC", "ABC", "ABC", "ABC", "ABC", "ABC", "ABC"]
      ]
    });

    waitsFor(nextFrame, 'next frame', 60);

    runs(function () {
      expect(this.$container.width()).toEqual(200);
    });
  });

  it('should respect width provided in CSS class', function () {
    $('<style>.myTable {overflow: auto; width: 200px}</style>').appendTo('head');
    this.$container.addClass('myTable');
    handsontable({
      data: [
        ["ABC", "ABC", "ABC", "ABC", "ABC", "ABC", "ABC", "ABC", "ABC"]
      ]
    });

    waitsFor(nextFrame, 'next frame', 60);

    runs(function () {
      expect(this.$container.width()).toEqual(200);
    });
  });
});
