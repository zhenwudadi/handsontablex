describe('CopyPaste', () => {
  var id = 'testContainer';

  beforeEach(function() {
    this.$container = $(`<div id="${id}"></div>`).appendTo('body');
  });

  afterEach(function() {
    if (this.$container) {
      destroy();
      this.$container.remove();
    }
  });

  const arrayOfArrays = function() {
    return [
      ['', 'Kia', 'Nissan', 'Toyota', 'Honda'],
      ['2008', 10, 11, 12, 13],
      ['2009', 20, 11, 14, 13],
      ['2010', 30, 15, 12, 13]
    ];
  };

  describe('enabling/disabing plugin', () => {
    it('should copyPaste be set enabled as default', () => {
      var hot = handsontable();

      expect(hot.getSettings().copyPaste).toBeTruthy();
      expect(hot.getPlugin('CopyPaste').textarea).toBeDefined();
    });

    it('should do not create textarea element if copyPaste is disabled on initialization', () => {
      var hot = handsontable({
        copyPaste: false
      });

      expect($('#HandsontableCopyPaste').length).toEqual(0);
    });
  });

  describe('working with multiple tables', () => {
    beforeEach(function() {
      this.$container2 = $(`<div id="${id}2"></div>`).appendTo('body');
    });

    afterEach(function() {
      if (this.$container2) {
        this.$container2.handsontable('destroy');
        this.$container2.remove();
      }
    });

    it('should disable copyPaste only in particular table', function() {
      const hot1 = handsontable();
      const hot2 = this.$container2.handsontable({
        copyPaste: false
      }).handsontable('getInstance');

      expect(hot1.getPlugin('CopyPaste').textarea).toBeDefined();
      expect(hot2.getPlugin('CopyPaste').textarea).toBeUndefined();
    });

    it('should create only one HandsontableCopyPaste regardless of the number of tables', function() {
      const hot1 = handsontable();
      const hot2 = this.$container2.handsontable();

      expect($('#HandsontableCopyPaste').length).toEqual(1);
    });

    it('should leave HandsontableCopyPaste as long as at least one table has copyPaste enabled', function() {
      var hot1 = handsontable();
      var hot2 = this.$container2.handsontable().handsontable('getInstance');

      expect($('#HandsontableCopyPaste').length).toEqual(1);

      hot1.updateSettings({
        copyPaste: false
      });

      expect($('#HandsontableCopyPaste').length).toEqual(1);

      hot2.updateSettings({
        copyPaste: false
      });

      expect($('#HandsontableCopyPaste').length).toEqual(0);
    });
  });

  describe('setting values copyable', () => {
    it('should set copyable text when selecting a single cell and hitting ctrl', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2)
      });

      const copyPasteTextarea = $('#HandsontableCopyPaste');

      expect(copyPasteTextarea.val().length).toEqual(0);

      selectCell(0, 0);
      keyDownUp(Handsontable.helper.KEY_CODES.CONTROL_LEFT);

      expect(copyPasteTextarea.val()).toEqual('A1');
    });

    it('should set copyable text when selecting a single cell and hitting left command', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2)
      });

      var copyPasteTextarea = $('#HandsontableCopyPaste');

      expect(copyPasteTextarea.val().length).toEqual(0);

      selectCell(0, 0);
      keyDownUp(Handsontable.helper.KEY_CODES.COMMAND_LEFT);

      expect(copyPasteTextarea.val()).toEqual('A1');
    });

    it('should set copyable text when selecting a single cell and hitting right command', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2)
      });

      var copyPasteTextarea = $('#HandsontableCopyPaste');

      expect(copyPasteTextarea.val().length).toEqual(0);

      selectCell(0, 0);
      keyDownUp(Handsontable.helper.KEY_CODES.COMMAND_RIGHT);

      expect(copyPasteTextarea.val()).toEqual('A1');
    });

    it('should set copyable text when selecting multiple cells and hitting ctrl', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2)
      });

      var copyPasteTextarea = $('#HandsontableCopyPaste');

      expect(copyPasteTextarea.val().length).toEqual(0);

      selectCell(0, 0, 1, 0);
      keyDownUp(Handsontable.helper.KEY_CODES.CONTROL_LEFT);

      expect(copyPasteTextarea.val()).toEqual('A1\nA2');
    });

    it('should set copyable text when selecting all cells with CTRL+A', (done) => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2)
      });

      var copyPasteTextarea = $('#HandsontableCopyPaste');

      expect(copyPasteTextarea.val().length).toEqual(0);

      selectCell(0, 0);

      $(document.activeElement).simulate('keydown', {keyCode: Handsontable.helper.KEY_CODES.A, ctrlKey: true});

      setTimeout(() => {
        expect(getSelected()).toEqual([0, 0, 1, 1]);
        expect(copyPasteTextarea.val()).toEqual('A1\tB1\nA2\tB2');
        done();
      }, 10);
    });

    it('should not throw error when no cell is selected (#1221)', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2)
      });

      selectCell(0, 0);
      deselectCell();

      function keydownCtrl() {
        $(document).simulate('keydown', {
          keyCode: Handsontable.helper.KEY_CODES.COMMAND_LEFT
        });
      }

      // expect no to throw any exception
      expect(keydownCtrl).not.toThrow();
    });

    it('should set copyable text when selecting a single cell with specified type and hitting ctrl (#1300)', () => {
      handsontable({
        data: [['A', 1], ['B', 2]],
        columns: [
          {
            type: 'text'
          },
          {
            type: 'numeric'
          }
        ]
      });

      var copyPasteTextarea = $('#HandsontableCopyPaste');

      expect(copyPasteTextarea.val().length).toEqual(0);

      selectCell(0, 0, 1, 1);
      keyDownUp(Handsontable.helper.KEY_CODES.CONTROL_LEFT);

      expect(copyPasteTextarea.val()).toEqual('A\t1\nB\t2');
    });

    it('should set copyable text when selecting a single cell with editor type as false (#2574)', () => {
      handsontable({
        data: [['A', 1], ['B', 2]],
        columns: [
          {
            type: 'text'
          },
          {
            editor: false
          }
        ]
      });

      var copyPasteTextarea = $('#HandsontableCopyPaste');

      expect(copyPasteTextarea.val().length).toEqual(0);

      selectCell(1, 1, 1, 1);
      keyDownUp(Handsontable.helper.KEY_CODES.CONTROL_LEFT);

      expect(copyPasteTextarea.val()).toEqual('2');
    });

    it('should set copyable text until copyRowsLimit is reached', () => {
      handsontable({
        data: arrayOfArrays(),
        copyPaste: {
          rowsLimit: 2
        },
      });

      selectCell(0, 0, countRows() - 1, countCols() - 1); // selectAll
      keyDownUp('ctrl');

      // should prepare 2 rows for copying
      expect($('#HandsontableCopyPaste').val()).toEqual('\tKia\tNissan\tToyota\tHonda\n2008\t10\t11\t12\t13');
    });

    it('should set copyable text until copyColsLimit is reached', () => {
      handsontable({
        data: arrayOfArrays(),
        copyPaste: {
          columnsLimit: 2
        },
      });

      selectCell(0, 0, countRows() - 1, countCols() - 1); // selectAll
      keyDownUp('ctrl');

      // should prepare 2 columns for copying
      expect($('#HandsontableCopyPaste').val()).toEqual('\tKia\n2008\t10\n2009\t20\n2010\t30');
    });

    it('should call onCopyLimit callback when copy limit was reached', () => {
      var result;

      handsontable({
        data: arrayOfArrays(),
        copyPaste: {
          rowsLimit: 2,
          columnsLimit: 2
        },
        afterCopyLimit(selectedRowsCount, selectedColsCount, copyRowsLimit, copyColsLimit) {
          result = [selectedRowsCount, selectedColsCount, copyRowsLimit, copyColsLimit];
        }
      });

      selectCell(0, 0, countRows() - 1, countCols() - 1); // selectAll
      keyDownUp('ctrl');
      expect(result).toEqual([4, 5, 2, 2]);
    });
  });

  describe('copy', () => {
    it('should be possible to copy data by keyboard shortcut', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
      });

      selectCell(1, 1);

      keyDown('ctrl');
      keyDown('ctrl+c');

      expect($('#HandsontableCopyPaste')[0]).toBe(document.activeElement);
      // unfortunately we have not access to read data from the system clipboard
    });

    it('should be possible to copy data by API', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
      });

      selectCell(1, 0);

      hot.getPlugin('CopyPaste').setCopyableText();
      // below line is cause of console warning in FF about execCommand
      hot.getPlugin('CopyPaste').copy(true);

      expect($('#HandsontableCopyPaste')[0]).toBe(document.activeElement);
      // unfortunately we have not access to read data from the system clipboard
    });

    it('should be possible to copy data by contextMenu option', () => {
      const beforeCopySpy = jasmine.createSpy('beforeCopy');
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
        beforeCopy: beforeCopySpy,
        contextMenu: ['copy']
      });

      selectCell(0, 1);
      contextMenu();

      var items = $('.htContextMenu tbody td');
      var actions = items.not('.htSeparator');

      actions.simulate('mousedown');

      expect(beforeCopySpy).toHaveBeenCalledTimes(1);
    });

    it('should call beforeCopy and afterCopy during copying operation', function () {
      const beforeCopySpy = jasmine.createSpy('beforeCopy');
      const afterCopySpy = jasmine.createSpy('afterCopy');

      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
        beforeCopy: beforeCopySpy,
        afterCopy: afterCopySpy
      });

      selectCell(0, 0);

      keyDown('ctrl');
      keyDown('ctrl+c');

      expect(beforeCopySpy.calls.count()).toEqual(1);
      expect(beforeCopySpy).toHaveBeenCalledWith([['A1']], [{startRow: 0, startCol: 0, endRow: 0, endCol: 0}], void 0, void 0, void 0, void 0);

      expect(afterCopySpy.calls.count()).toEqual(1);
      expect(afterCopySpy).toHaveBeenCalledWith([['A1']], [{startRow: 0, startCol: 0, endRow: 0, endCol: 0}], void 0, void 0, void 0, void 0);
    });

    it('should be possible to block copying', function () {
      const afterCopySpy = jasmine.createSpy('afterCopy');
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
        beforeCopy() {
          return false;
        },
        afterCopy: afterCopySpy
      });

      selectCell(0, 0);

      keyDown('ctrl');
      keyDown('ctrl+c');

      expect(afterCopySpy.calls.count()).toEqual(0);
    });

  });

  describe('cut', () => {
    it('should be possible to cut data by keyboard shortcut', async () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
      });

      selectCell(1, 1);

      keyDown('ctrl');
      keyDown('ctrl+x');

      expect($('#HandsontableCopyPaste')[0]).toBe(document.activeElement);

      await sleep(100);

      expect(hot.getDataAtCell(1, 1)).toBe('');
      // unfortunately we have not access to read data from the system clipboard
    });

    it('should be possible to cut data by API', async () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
      });

      selectCell(1, 0);

      hot.getPlugin('CopyPaste').setCopyableText();
      // below line is cause of console warning in FF about execCommand
      hot.getPlugin('CopyPaste').cut(true);

      expect($('#HandsontableCopyPaste')[0]).toBe(document.activeElement);

      await sleep(100);

      expect(hot.getDataAtCell(1, 0)).toBe('');
      // unfortunately we have not access to read data from the system clipboard
    });

    it('should be possible to cut data by contextMenu option', () => {
      const beforeCutSpy = jasmine.createSpy('beforeCopy');
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
        beforeCut: beforeCutSpy,
        contextMenu: ['cut']
      });

      selectCell(0, 1);
      contextMenu();

      var items = $('.htContextMenu tbody td');
      var actions = items.not('.htSeparator');

      actions.simulate('mousedown');

      expect(beforeCutSpy).toHaveBeenCalledTimes(1);
    });

    xit('should allow blocking cutting cells by stopping the immediate propagation', async () => {
      var beforeCutSpy = jasmine.createSpy('beforeCut');
      var hot = handsontable({
        data: [
          ['2012', 10, 11, 12, 13, 15, 16],
          ['2013', 10, 11, 12, 13, 15, 16]
        ],
        beforeKeyDown(event) {
          if (event.ctrlKey && event.keyCode === Handsontable.helper.KEY_CODES.X) {
            event.isImmediatePropagationEnabled = false;
          }
        },
        beforeCut: beforeCutSpy,
      });

      selectCell(0, 0);
      keyDown('ctrl+x');

      await sleep(100);

      expect(beforeCutSpy).toHaveBeenCalledTimes(0);
    });

    it('should call beforeCut and afterCut during cutting out operation', function () {
      var beforeCutSpy = jasmine.createSpy('beforeCut');
      var afterCutSpy = jasmine.createSpy('afterCut');
      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
        beforeCut: beforeCutSpy,
        afterCut: afterCutSpy
      });

      selectCell(0, 0);

      keyDown('ctrl');
      keyDown('ctrl+x');

      expect(beforeCutSpy.calls.count()).toEqual(1);
      expect(beforeCutSpy).toHaveBeenCalledWith([['A1']], [{startRow: 0, startCol: 0, endRow: 0, endCol: 0}], void 0, void 0, void 0, void 0);

      expect(afterCutSpy.calls.count()).toEqual(1);
      expect(afterCutSpy).toHaveBeenCalledWith([['A1']], [{startRow: 0, startCol: 0, endRow: 0, endCol: 0}], void 0, void 0, void 0, void 0);
    });

    it('should be possible to block cutting out', function () {
      var afterCutSpy = jasmine.createSpy('afterCut');
      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
        beforeCut() {
          return false;
        },
        afterCut: afterCutSpy
      });

      selectCell(0, 0);

      keyDown('ctrl');
      keyDown('ctrl+x');

      expect(afterCutSpy.calls.count()).toEqual(0);
    });
  });

  describe('paste', () => {
    // TODO o_O ???
    xit('should remove additional new line from copied text (only safari)', () => {
      var getData = jasmine.createSpy().and.returnValue('a\nb\n\n');
      var preventDefault = jasmine.createSpy();
      var hot = handsontable();

      $('#HandsontableCopyPaste').onpaste(
        {clipboardData: {getData},
          preventDefault
        });

      if (Handsontable.helper.isSafari()) {
        expect($('#HandsontableCopyPaste').value).toEqual('a\nb\n');
        expect(getData).toHaveBeenCalledWith('Text');
        expect(preventDefault).toHaveBeenCalled();

      } else if (Handsontable.helper.isChrome()) {
        expect($('#HandsontableCopyPaste').value).toBe('a\nb\n\n');
        expect(getData).toHaveBeenCalledWith('Text');
        expect(preventDefault).toHaveBeenCalled();
      }
    });

    it('should not create new rows or columns when allowInsertRow and allowInsertColumn equal false', (done) => {
      handsontable({
        data: arrayOfArrays(),
        copyPaste: {
          pasteMode: 'shift_down',
        },
        allowInsertRow: false,
        allowInsertColumn: false
      });

      selectCell(3, 4); // selectAll
      triggerPaste('Kia\tNissan\tToyota');

      setTimeout(() => {
        let expected = arrayOfArrays();
        expected[3][4] = 'Kia';
        expect(getData()).toEqual(expected);
        done();
      }, 60);
    });

    it('should shift data down instead of overwrite when paste (when allowInsertRow = false)', (done) => {
      handsontable({
        data: arrayOfArrays(),
        copyPaste: {
          pasteMode: 'shift_down',
        },
        allowInsertRow: false
      });

      selectCell(1, 0); // selectAll
      triggerPaste('Kia\tNissan\tToyota');

      setTimeout(() => {
        expect(getData().length).toEqual(4);
        expect(getData(0, 0, 2, 4)).toEqual([['', 'Kia', 'Nissan', 'Toyota', 'Honda'], ['Kia', 'Nissan', 'Toyota', 12, 13], ['2008', 10, 11, 14, 13]]);
        done();
      }, 60);
    });

    it('should shift data down instead of overwrite when paste (minSpareRows > 0)', (done) => {
      handsontable({
        data: arrayOfArrays(),
        copyPaste: {
          pasteMode: 'shift_down'
        },
        minSpareRows: 1
      });

      selectCell(1, 0); // selectAll
      triggerPaste('Kia\tNissan\tToyota');

      setTimeout(() => {
        expect(getData().length).toEqual(6);
        expect(getData(0, 0, 2, 4)).toEqual([['', 'Kia', 'Nissan', 'Toyota', 'Honda'], ['Kia', 'Nissan', 'Toyota', 12, 13], ['2008', 10, 11, 14, 13]]);
        done();
      }, 60);
    });

    it('should shift right insert instead of overwrite when paste', (done) => {
      handsontable({
        data: arrayOfArrays(),
        copyPaste: {
          pasteMode: 'shift_right'
        },
        allowInsertColumn: false
      });

      selectCell(1, 0); // selectAll
      triggerPaste('Kia\tNissan\tToyota');

      setTimeout(() => {
        expect(getData()[0].length).toEqual(5);
        expect(getDataAtRow(1)).toEqual(['Kia', 'Nissan', 'Toyota', '2008', 10]);
        done();
      }, 60);
    });

    it('should shift right insert instead of overwrite when paste (minSpareCols > 0)', (done) => {
      handsontable({
        data: arrayOfArrays(),
        copyPaste: {
          pasteMode: 'shift_right'
        },
        minSpareCols: 1
      });

      selectCell(1, 0); // selectAll
      triggerPaste('Kia\tNissan\tToyota');

      setTimeout(() => {
        expect(getData()[0].length).toEqual(9);
        expect(getDataAtRow(1)).toEqual(['Kia', 'Nissan', 'Toyota', '2008', 10, 11, 12, 13, null]);
        done();
      }, 60);
    });

    it('should not throw an error when changes are null in `once` hook', (done) => {
      var errors = 0;

      try {
        handsontable({
          data: arrayOfArrays(),
          afterChange(changes, source) {
            if (source === 'loadData') {
              return;
            }

            loadData(arrayOfArrays());
          }
        });

        selectCell(1, 0); // selectAll
        triggerPaste('Kia\tNissan\tToyota');

      } catch (e) {
        errors++;
      }

      setTimeout(() => {
        expect(errors).toEqual(0);
        done();
      }, 60);
    });

    it('should not paste any data, if no cell is selected', function(done) {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(3, 1)
      });

      const copiedData1 = 'foo';
      const copiedData2 = 'bar';

      expect(this.$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('A1');
      expect(this.$container.find('tbody tr:eq(1) td:eq(0)').text()).toEqual('A2');
      expect(this.$container.find('tbody tr:eq(2) td:eq(0)').text()).toEqual('A3');

      expect(getSelected()).toBeUndefined();

      triggerPaste(copiedData1);

      setTimeout(() => {
        expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('A1');
        expect(spec().$container.find('tbody tr:eq(1) td:eq(0)').text()).toEqual('A2');
        expect(spec().$container.find('tbody tr:eq(2) td:eq(0)').text()).toEqual('A3');
      }, 100);

      setTimeout(() => {
        selectCell(1, 0, 2, 0);

        triggerPaste(copiedData2);
      }, 200);

      setTimeout(() => {
        expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('A1');
        expect(spec().$container.find('tbody tr:eq(1) td:eq(0)').text()).toEqual(copiedData2);
        expect(spec().$container.find('tbody tr:eq(2) td:eq(0)').text()).toEqual(copiedData2);
        done();
      }, 300);
    });

    it('should not paste any data, if no cell is selected (select/deselect cell using mouse)', function(done) {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(3, 1)
      });

      const copiedData = 'foo';

      expect(this.$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('A1');
      expect(this.$container.find('tbody tr:eq(1) td:eq(0)').text()).toEqual('A2');
      expect(this.$container.find('tbody tr:eq(2) td:eq(0)').text()).toEqual('A3');

      this.$container.find('tbody tr:eq(1) td:eq(0)').simulate('mousedown');
      this.$container.find('tbody tr:eq(1) td:eq(0)').simulate('mouseup');

      expect(getSelected()).toEqual([1, 0, 1, 0]);

      $('html').simulate('mousedown');
      $('html').simulate('mouseup');

      expect(getSelected()).toBeUndefined();

      triggerPaste(copiedData);

      setTimeout(() => {
        expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('A1');
        expect(spec().$container.find('tbody tr:eq(1) td:eq(0)').text()).toEqual('A2');
        expect(spec().$container.find('tbody tr:eq(2) td:eq(0)').text()).toEqual('A3');
        done();
      }, 100);
    });

    it('should call beforePaste and afterPaste during copying operation', function (done) {
      var beforePasteSpy = jasmine.createSpy('beforePaste');
      var afterPasteSpy = jasmine.createSpy('afterPaste');

      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
        beforePaste: beforePasteSpy,
        afterPaste: afterPasteSpy
      });

      selectCell(0, 0);
      keyDown('ctrl');
      triggerPaste('Kia');

      setTimeout(function() {
        expect(beforePasteSpy.calls.count()).toEqual(1);
        expect(beforePasteSpy).toHaveBeenCalledWith([['Kia']], [{startRow: 0, startCol: 0, endRow: 0, endCol: 0}], void 0, void 0, void 0, void 0);

        expect(afterPasteSpy.calls.count()).toEqual(1);
        expect(afterPasteSpy).toHaveBeenCalledWith([['Kia']], [{startRow: 0, startCol: 0, endRow: 0, endCol: 0}], void 0, void 0, void 0, void 0);
        done();
      }, 60);
    });

    it('should be possible to block pasting', function (done) {
      var afterPasteSpy = jasmine.createSpy('afterPaste');

      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
        beforePaste() {
          return false;
        },
        afterPaste: afterPasteSpy
      });

      selectCell(0, 0);
      keyDown('ctrl');
      triggerPaste('Kia');

      setTimeout(function() {
        expect(afterPasteSpy.calls.count()).toEqual(0);
        done();
      }, 60);
    });
  });
});
