describe('WalkontableDom', function () {
  var wtDom = new WalkontableDom();

  describe('offset', function () {
    var $window = $(window),
      $forceScrollbar = $('<div id="forceScrollbar"></div>').css({
        position: 'absolute',
        height: '4000px',
        width: '4000px',
        top: 0,
        left: 0
      });

    beforeEach(function () {
      $forceScrollbar.appendTo(document.body);
      this.$div = $('<div id="test"></div>').appendTo($forceScrollbar);
      this.div = this.$div[0];
    });

    afterEach(function () {
      this.$div.remove();
      $forceScrollbar.remove();
    });

    describe('top', function () {
      it("should return offset top with position absolute", function () {
        this.$div.css({position: 'absolute', top: 200});
        expect(wtDom.offset(this.div).top).toEqual(200);
      });

      it("should return offset top with position absolute & scrolled window", function () {
        this.$div.css({position: 'absolute', top: 200});
        $window.scrollTop(1900);
        expect(wtDom.offset(this.div).top).toEqual(200);
        $window.scrollTop(0);
      });

      it("should return offset top with position fixed", function () {
        this.$div.css({position: 'fixed', top: 200});
        expect(wtDom.offset(this.div).top).toEqual(200);
      });

      it("should return offset top with position fixed & scrolled window", function () {
        this.$div.css({position: 'fixed', top: 200});
        $window.scrollTop(1900);
        expect(wtDom.offset(this.div).top).toEqual(2100); //this is the same jQuery offset returns
        $window.scrollTop(0);
      });
    });

    describe('left', function () {
      it("should return offset left with position absolute", function () {
        this.$div.css({position: 'absolute', left: 200});
        expect(wtDom.offset(this.div).left).toEqual(200);
      });

      it("should return offset left with position absolute & scrolled window", function () {
        this.$div.css({position: 'absolute', left: 200});
        $window.scrollLeft(1900);
        expect(wtDom.offset(this.div).left).toEqual(200);
        $window.scrollLeft(0);
      });

      it("should return offset left with position fixed", function () {
        this.$div.css({position: 'fixed', left: 200});
        expect(wtDom.offset(this.div).left).toEqual(200);
      });

      it("should return offset left with position fixed & scrolled window", function () {
        this.$div.css({position: 'fixed', left: 200});
        $window.scrollLeft(1900);
        expect(wtDom.offset(this.div).left).toEqual(2100); //this is the same jQuery offset returns
        $window.scrollLeft(0);
      });
    });
  });

  describe('isVisible', function () {
    it("should return true for appended table", function () {
      var $table = $('<table></table>').appendTo('body');

      var wtDom = new WalkontableDom();
      expect(wtDom.isVisible($table[0])).toBe(true);

      $table.remove();
    });

    it("should return true for Walkontable", function () {
      var $table = $('<table></table>').appendTo('body');
      createDataArray(2, 2);

      var wt = new Walkontable({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();

      var wtDom = new WalkontableDom();
      expect(wtDom.isVisible($table[0])).toBe(true);

      $table.remove();
    });

    it("should return false for not appended table", function () {
      var $table = $('<table></table>');

      var wtDom = new WalkontableDom();
      expect(wtDom.isVisible($table[0])).toBe(false);

      $table.remove();
    });

    it("should return false for table with `display: none`", function () {
      var $table = $('<table style="display: none"></table>').appendTo('body');

      var wtDom = new WalkontableDom();
      expect(wtDom.isVisible($table[0])).toBe(false);

      $table.remove();
    });

    it("should return false for table with parent `display: none`", function () {
      var $div = $('<div style="display: none"></div>').appendTo('body');
      var $table = $('<table></table>').appendTo($div);

      var wtDom = new WalkontableDom();
      expect(wtDom.isVisible($table[0])).toBe(false);

      $table.remove();
    });
  });

  it("should return font size", function () {
    var $html = $('<style>.bigText{font: 12px serif;}</style><div class="bigText"><span id="testable"></span></div>').appendTo('body');

    var span = document.getElementById('testable');
    var compStyle = wtDom.getComputedStyle(span);
    expect(compStyle['fontSize'], '12px');

    $html.remove();
  });

  it("should return top border width", function () {
    var $html = $('<style>.redBorder{border: 10px solid red;}</style><div class="redBorder" id="testable"></div>').appendTo('body');

    var div = document.getElementById('testable');
    var compStyle = wtDom.getComputedStyle(div);
    expect(compStyle['borderTopWidth'], '10px');

    $html.remove();
  });
});