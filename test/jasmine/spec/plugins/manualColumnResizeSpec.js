describe('manualColumnResize', function () {
  var id = 'testContainer';

  beforeEach(function () {
    this.$container = $('<div id="' + id + '"></div>').appendTo('body');
  });

  afterEach(function () {
    if (this.$container) {
      destroy();
      this.$container.remove();
    }
  });

  function resizeColumn(displayedColumnIndex, width) {
    var $th = this.$container.find('thead tr:eq(0) th:eq(' + displayedColumnIndex +')');

    $th.trigger('mouseenter');

    var $resizer = this.$container.find('.manualColumnResizer');
    var resizerPosition = $resizer.position();


    var mouseDownEvent = new $.Event('mousedown', {pageX: resizerPosition.left});
    $resizer.trigger(mouseDownEvent);

    var delta = width - $th.outerWidth();
    var mouseMoveEvent = new $.Event('mousemove', {pageX: resizerPosition.left + delta});
    $resizer.trigger(mouseMoveEvent);

    $resizer.trigger('mouseup');
  }

  it("should change column widths at init", function () {
    handsontable({
      manualColumnResize: [100, 150, 180]
    });

    expect(this.$container.find('tbody tr:eq(0) td:eq(0)').outerWidth()).toEqual(100);
    expect(this.$container.find('tbody tr:eq(0) td:eq(1)').outerWidth()).toEqual(150);
    expect(this.$container.find('tbody tr:eq(0) td:eq(2)').outerWidth()).toEqual(180);
  });

  it("should change the default column widths with updateSettings", function () {
    handsontable({
      manualColumnResize: true
    });

    expect(this.$container.find('tbody tr:eq(0) td:eq(0)').outerWidth()).toEqual(50);
    expect(this.$container.find('tbody tr:eq(0) td:eq(1)').outerWidth()).toEqual(50);
    expect(this.$container.find('tbody tr:eq(0) td:eq(2)').outerWidth()).toEqual(50);

    updateSettings({
      manualColumnResize: [60, 50, 80]
    });

    expect(this.$container.find('tbody tr:eq(0) td:eq(0)').outerWidth()).toEqual(60);
    expect(this.$container.find('tbody tr:eq(0) td:eq(1)').outerWidth()).toEqual(50);
    expect(this.$container.find('tbody tr:eq(0) td:eq(2)').outerWidth()).toEqual(80);
  });

  it("should change column widths with updateSettings", function () {
    handsontable({
      manualColumnResize: [100, 150, 180]
    });

    expect(this.$container.find('tbody tr:eq(0) td:eq(0)').outerWidth()).toEqual(100);
    expect(this.$container.find('tbody tr:eq(0) td:eq(1)').outerWidth()).toEqual(150);
    expect(this.$container.find('tbody tr:eq(0) td:eq(2)').outerWidth()).toEqual(180);

    updateSettings({
      manualColumnResize: [60, 50, 80]
    });

    expect(this.$container.find('tbody tr:eq(0) td:eq(0)').outerWidth()).toEqual(60);
    expect(this.$container.find('tbody tr:eq(0) td:eq(1)').outerWidth()).toEqual(50);
    expect(this.$container.find('tbody tr:eq(0) td:eq(2)').outerWidth()).toEqual(80);
  });

  it("should reset column widths", function () {
    handsontable({
      manualColumnResize: [100, 150, 180]
    });

    expect(this.$container.find('tbody tr:eq(0) td:eq(0)').outerWidth()).toEqual(100);
    expect(this.$container.find('tbody tr:eq(0) td:eq(1)').outerWidth()).toEqual(150);
    expect(this.$container.find('tbody tr:eq(0) td:eq(2)').outerWidth()).toEqual(180);

    updateSettings({
      manualColumnResize: true
    });

    expect(this.$container.find('tbody tr:eq(0) td:eq(0)').outerWidth()).toEqual(50);
    expect(this.$container.find('tbody tr:eq(0) td:eq(1)').outerWidth()).toEqual(50);
    expect(this.$container.find('tbody tr:eq(0) td:eq(2)').outerWidth()).toEqual(50);
  });

  it("should resize appropriate columns, even if the column order was changed with manualColumnMove plugin", function () {
    handsontable({
      colHeaders: true,
      manualColumnMove: [2, 1, 0, 3],
      manualColumnResize: true
    });

    var $columnHeaders = this.$container.find('thead tr:eq(0) th');
    var initialColumnWidths = [];

    $columnHeaders.each(function(){
       initialColumnWidths.push($(this).width());
    });

    resizeColumn.call(this, 0, 100)

    var $resizedTh = $columnHeaders.eq(0);

    expect($resizedTh.text()).toEqual('C');
    expect($resizedTh.outerWidth()).toEqual(100);

    //Sizes of remaining columns should stay the same
    for(var i = 1; i < $columnHeaders.length; i++){
      expect($columnHeaders.eq(i).width()).toEqual(initialColumnWidths[i]);
    }

  });
});