describe('settings', function () {
  describe('colWidths', function () {
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

    describe('defined in constructor', function () {
      it('should consider colWidths provided as array of numbers', function () {
        handsontable({
          colWidths: [123]
        });

        expect(colWidth(this.$container, 0)).toBe(123);
      });

      it('should consider colWidth provided as function that returns number', function () {
        handsontable({
          colWidths: function (index) {
            if (index === 0) {
              return 123;
            }
            else {
              return 50;
            }
          }
        });

        expect(colWidth(this.$container, 0)).toBe(123);
      });
    });
  });
});