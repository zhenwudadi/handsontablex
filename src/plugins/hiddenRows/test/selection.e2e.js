describe('HiddenRows', () => {
  const id = 'testContainer';

  beforeEach(function() {
    this.$container = $(`<div id="${id}"></div>`).appendTo('body');
  });

  afterEach(function() {
    if (this.$container) {
      destroy();
      this.$container.remove();
    }
  });

  describe('cell selection UI', () => {
    it('should select entire row by header if first column is hidden', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenRows: {
          rows: [0],
        },
      });

      const header = getCell(-1, 0);

      simulateClick(header, 'LMB');

      expect(getSelected()).toEqual([[-1, 0, 4, 0]]);
      expect(getSelectedRangeLast().highlight.row).toBe(1);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(0);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(0);
      expect(`
        |   ║ * :   :   :   :   |
        |===:===:===:===:===:===|
        | - ║ A :   :   :   :   |
        | - ║ 0 :   :   :   :   |
        | - ║ 0 :   :   :   :   |
        | - ║ 0 :   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select entire row by header if last column is hidden', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenRows: {
          rows: [4],
        },
      });

      const header = getCell(-1, 0);

      simulateClick(header, 'LMB');

      expect(getSelected()).toEqual([[-1, 0, 4, 0]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(0);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(0);
      expect(`
        |   ║ * :   :   :   :   |
        |===:===:===:===:===:===|
        | - ║ A :   :   :   :   |
        | - ║ 0 :   :   :   :   |
        | - ║ 0 :   :   :   :   |
        | - ║ 0 :   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select entire row by header if any column in the middle is hidden', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenRows: {
          rows: [1, 2, 3],
        },
      });

      const header = getCell(-1, 0);

      simulateClick(header, 'LMB');

      expect(getSelected()).toEqual([[-1, 0, 4, 0]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(0);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(0);
      expect(`
        |   ║ * :   :   :   :   |
        |===:===:===:===:===:===|
        | - ║ A :   :   :   :   |
        | - ║ 0 :   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select entire row by header if all rows are hidden', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenRows: {
          rows: [0, 1, 2, 3, 4],
        },
      });

      const header = $('.ht_clone_left .htCore thead tr th').eq(0); // The corner

      simulateClick(header, 'LMB');

      expect(getSelected()).toEqual([[-1, -1, 4, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
        |   | * : * : * : * : * |
        |===:===:===:===:===:===|
      `).toBeMatchToSelectionPattern();
    });

    it('should keep hidden rows in cell range', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenRows: {
          rows: [1, 2, 3],
        },
      });

      const startCell = getCell(0, 0);
      const endCell = getCell(4, 0);

      mouseDown(startCell, 'LMB');
      mouseOver(endCell);
      mouseUp(endCell);

      expect(getSelected()).toEqual([[0, 0, 4, 0]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(0);
      expect(getSelectedRangeLast().from.col).toBe(0);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(0);
      expect(`
        |   ║ - :   :   :   :   |
        |===:===:===:===:===:===|
        | - ║ A :   :   :   :   |
        | - ║ 0 :   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select non-contiguous rows properly when there are some hidden rows', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(8, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenRows: {
          rows: [0, 1],
        },
      });

      const startColumn = getCell(4, -1);
      const endColumn = getCell(6, -1);

      mouseDown(startColumn, 'LMB');
      mouseUp(startColumn);

      keyDown('ctrl');

      mouseDown(endColumn, 'LMB');
      mouseUp(endColumn);

      keyUp('ctrl');

      expect(getSelected()).toEqual([
        [4, -1, 4, 4],
        [6, -1, 6, 4],
      ]);
      expect(getSelectedRangeLast().highlight.row).toBe(6);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(6);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(6);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
        |   ║ - : - : - : - : - |
        |===:===:===:===:===:===|
        |   ║   :   :   :   :   |
        |   ║   :   :   :   :   |
        | * ║ 0 : 0 : 0 : 0 : 0 |
        |   ║   :   :   :   :   |
        | * ║ A : 0 : 0 : 0 : 0 |
        |   ║   :   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select cells by using two layers when CTRL key is pressed and some rows are hidden', () => {
      handsontable({
        rowHeaders: true,
        colHeaders: true,
        startRows: 12,
        startCols: 8,
        hiddenRows: {
          rows: [0, 1],
        },
      });

      $(getCell(3, 1)).simulate('mousedown');
      $(getCell(6, 4)).simulate('mouseover').simulate('mouseup');

      expect(getSelected()).toEqual([[3, 1, 6, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(3);
      expect(getSelectedRangeLast().highlight.col).toBe(1);
      expect(getSelectedRangeLast().from.row).toBe(3);
      expect(getSelectedRangeLast().from.col).toBe(1);
      expect(getSelectedRangeLast().to.row).toBe(6);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
        |   ║   : - : - : - : - :   :   :   |
        |===:===:===:===:===:===:===:===:===|
        |   ║   :   :   :   :   :   :   :   |
        | - ║   : A : 0 : 0 : 0 :   :   :   |
        | - ║   : 0 : 0 : 0 : 0 :   :   :   |
        | - ║   : 0 : 0 : 0 : 0 :   :   :   |
        | - ║   : 0 : 0 : 0 : 0 :   :   :   |
        |   ║   :   :   :   :   :   :   :   |
        |   ║   :   :   :   :   :   :   :   |
        |   ║   :   :   :   :   :   :   :   |
        |   ║   :   :   :   :   :   :   :   |
        |   ║   :   :   :   :   :   :   :   |
      `).toBeMatchToSelectionPattern();

      keyDown('ctrl');

      $(getCell(5, 3)).simulate('mousedown');
      $(getCell(8, 5)).simulate('mouseover').simulate('mouseup');

      expect(getSelected()).toEqual([[3, 1, 6, 4], [5, 3, 8, 5]]);
      expect(getSelectedRangeLast().highlight.row).toBe(5);
      expect(getSelectedRangeLast().highlight.col).toBe(3);
      expect(getSelectedRangeLast().from.row).toBe(5);
      expect(getSelectedRangeLast().from.col).toBe(3);
      expect(getSelectedRangeLast().to.row).toBe(8);
      expect(getSelectedRangeLast().to.col).toBe(5);
      expect(`
        |   ║   : - : - : - : - : - :   :   |
        |===:===:===:===:===:===:===:===:===|
        |   ║   :   :   :   :   :   :   :   |
        | - ║   : 0 : 0 : 0 : 0 :   :   :   |
        | - ║   : 0 : 0 : 0 : 0 :   :   :   |
        | - ║   : 0 : 0 : B : 1 : 0 :   :   |
        | - ║   : 0 : 0 : 1 : 1 : 0 :   :   |
        | - ║   :   :   : 0 : 0 : 0 :   :   |
        | - ║   :   :   : 0 : 0 : 0 :   :   |
        |   ║   :   :   :   :   :   :   :   |
        |   ║   :   :   :   :   :   :   :   |
        |   ║   :   :   :   :   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });

    describe('should select entire table after the corner was clicked and', () => {
      it('just some rows were hidden', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(5, 5),
          rowHeaders: true,
          colHeaders: true,
          hiddenRows: {
            rows: [0, 1, 2],
          },
        });

        const corner = $('.ht_clone_top_left_corner .htCore thead th').eq(0);

        simulateClick(corner, 'LMB');

        expect(getSelected()).toEqual([[-1, -1, 4, 4]]);
        expect(`
          |   ║ * : * : * : * : * |
          |===:===:===:===:===:===|
          | * ║ A : 0 : 0 : 0 : 0 |
          | * ║ 0 : 0 : 0 : 0 : 0 |
        `).toBeMatchToSelectionPattern();
      });

      it('all rows were hidden', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(5, 5),
          rowHeaders: true,
          colHeaders: true,
          hiddenRows: {
            rows: [0, 1, 2, 3, 4],
          },
        });

        const corner = $('.ht_clone_top_left_corner .htCore thead th').eq(0);

        simulateClick(corner, 'LMB');

        expect(getSelected()).toEqual([[-1, -1, 4, 4]]);
        expect(`
          |   | * : * : * : * : * |
          |===:===:===:===:===:===|
        `).toBeMatchToSelectionPattern();
      });
    });
  });

  describe('cell selection (API)', () => {
    // Do we need this test case?
    it('should not throw any errors, when selecting a whole row with the last column hidden', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(4, 4),
        hiddenRows: {
          rows: [3]
        },
        rowHeaders: true,
      });

      expect(() => {
        hot.selectCell(0, 2, 3, 2);
      }).not.toThrow();
    });

    it('should select entire table after call selectAll if some rows are hidden', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenRows: {
          rows: [0, 1],
        },
      });

      selectAll();

      expect(getSelected()).toEqual([[-1, -1, 4, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(2);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
        |   ║ * : * : * : * : * |
        |===:===:===:===:===:===|
        | * ║ A : 0 : 0 : 0 : 0 |
        | * ║ 0 : 0 : 0 : 0 : 0 |
        | * ║ 0 : 0 : 0 : 0 : 0 |
      `).toBeMatchToSelectionPattern();
    });

    it('should select entire table after call selectAll if all of rows are hidden', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenRows: {
          rows: [0, 1, 2, 3, 4],
        },
      });

      selectAll();

      expect(getSelected()).toEqual([[-1, -1, 4, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0); // a fallback to 0
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
        |   | * : * : * : * : * |
        |===:===:===:===:===:===|
      `).toBeMatchToSelectionPattern();
    });

    it('should select entire column after call selectColumns if the first row is hidden', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenRows: {
          rows: [0],
        },
      });

      selectColumns(0);

      expect(getSelected()).toEqual([[-1, 0, 4, 0]]);
      expect(getSelectedRangeLast().highlight.row).toBe(1);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(0);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(0);
      expect(`
        |   ║ * :   :   :   :   |
        |===:===:===:===:===:===|
        | - ║ A :   :   :   :   |
        | - ║ 0 :   :   :   :   |
        | - ║ 0 :   :   :   :   |
        | - ║ 0 :   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select entire column after call selectColumns if the last row is hidden', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenRows: {
          rows: [4],
        },
      });

      selectColumns(0);

      expect(getSelected()).toEqual([[-1, 0, 4, 0]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(0);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(0);
      expect(`
        |   ║ * :   :   :   :   |
        |===:===:===:===:===:===|
        | - ║ A :   :   :   :   |
        | - ║ 0 :   :   :   :   |
        | - ║ 0 :   :   :   :   |
        | - ║ 0 :   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select entire column after call selectColumns if rows between the first and the last are hidden', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenRows: {
          rows: [1, 2, 3],
        },
      });

      selectColumns(0);

      expect(getSelected()).toEqual([[-1, 0, 4, 0]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(0);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(0);
      expect(`
        |   ║ * :   :   :   :   |
        |===:===:===:===:===:===|
        | - ║ A :   :   :   :   |
        | - ║ 0 :   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select hidden row internally after the `selectRows` call (no visual effect)', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenRows: {
          rows: [1],
        },
      });

      selectRows(1);

      expect(getSelected()).toEqual([[1, -1, 1, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(1); // a fallback to 1
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(1);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(1);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
        |   ║   :   :   :   :   |
        |===:===:===:===:===:===|
        |   ║   :   :   :   :   |
        |   ║   :   :   :   :   |
        |   ║   :   :   :   :   |
        |   ║   :   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select rows after the `selectRows` call if range is partially hidden at the beginning of selection #1', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenRows: {
          rows: [1, 2, 3],
        },
      });

      selectRows(1, 4);

      expect(getSelected()).toEqual([[1, -1, 4, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(4);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(1);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
        |   ║ - : - : - : - : - |
        |===:===:===:===:===:===|
        |   ║   :   :   :   :   |
        | * ║ A : 0 : 0 : 0 : 0 |
      `).toBeMatchToSelectionPattern();
    });

    it('should select rows after the `selectRows` call if range is partially hidden at the beginning of selection #2', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenRows: {
          rows: [1, 2, 3],
        },
      });

      selectRows(2, 4);

      expect(getSelected()).toEqual([[2, -1, 4, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(4);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(2);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
        |   ║ - : - : - : - : - |
        |===:===:===:===:===:===|
        |   ║   :   :   :   :   |
        | * ║ A : 0 : 0 : 0 : 0 |
      `).toBeMatchToSelectionPattern();
    });

    it('should select rows after the `selectRows` call if range is partially hidden at the end of selection #1', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenRows: {
          rows: [1, 2, 3],
        },
      });

      selectRows(0, 2);

      expect(getSelected()).toEqual([[0, -1, 2, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(0);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(2);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
        |   ║ - : - : - : - : - |
        |===:===:===:===:===:===|
        | * ║ A : 0 : 0 : 0 : 0 |
        |   ║   :   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select rows after the `selectRows` call if range is partially hidden at the end of selection #2', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenRows: {
          rows: [1, 2, 3],
        },
      });

      selectRows(0, 3);

      expect(getSelected()).toEqual([[0, -1, 3, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(0);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(3);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
        |   ║ - : - : - : - : - |
        |===:===:===:===:===:===|
        | * ║ A : 0 : 0 : 0 : 0 |
        |   ║   :   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select rows after call selectRows if range is partially hidden in the middle of selection', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenRows: {
          rows: [1, 2, 3],
        },
      });

      selectRows(0, 4);

      expect(getSelected()).toEqual([[0, -1, 4, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(0);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
        |   ║ - : - : - : - : - |
        |===:===:===:===:===:===|
        | * ║ A : 0 : 0 : 0 : 0 |
        | * ║ 0 : 0 : 0 : 0 : 0 |
      `).toBeMatchToSelectionPattern();
    });

    it('should select rows after call selectRows if range is partially hidden at the start and at the end of the range', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenRows: {
          rows: [1, 3],
        },
      });

      selectRows(1, 3);

      expect(getSelected()).toEqual([[1, -1, 3, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(2);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(1);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(3);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
        |   ║ - : - : - : - : - |
        |===:===:===:===:===:===|
        |   ║   :   :   :   :   |
        | * ║ A : 0 : 0 : 0 : 0 |
        |   ║   :   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });
  });

  describe('redrawing rendered selection when the selected range has been changed', () => {
    describe('by showing rows placed before the current selection', () => {
      it('single cell was selected', () => {
        handsontable({
          rowHeaders: true,
          colHeaders: true,
          startRows: 5,
          startCols: 5,
          hiddenRows: {
            rows: [0, 1, 2],
          },
        });

        selectCell(3, 3);
        getPlugin('hiddenRows').showRows([0]);
        render();

        expect(getSelected()).toEqual([[3, 3, 3, 3]]);
        expect(getSelectedRangeLast().highlight.row).toBe(3);
        expect(getSelectedRangeLast().highlight.col).toBe(3);
        expect(getSelectedRangeLast().from.row).toBe(3);
        expect(getSelectedRangeLast().from.col).toBe(3);
        expect(getSelectedRangeLast().to.row).toBe(3);
        expect(getSelectedRangeLast().to.col).toBe(3);
        expect(`
          |   ║   :   :   : - :   |
          |===:===:===:===:===:===|
          |   ║   :   :   :   :   |
          | - ║   :   :   : # :   |
          |   ║   :   :   :   :   |
        `).toBeMatchToSelectionPattern();

        getPlugin('hiddenRows').showRows([1, 2]);
        render();

        expect(getSelected()).toEqual([[3, 3, 3, 3]]);
        expect(getSelectedRangeLast().highlight.row).toBe(3);
        expect(getSelectedRangeLast().highlight.col).toBe(3);
        expect(getSelectedRangeLast().from.row).toBe(3);
        expect(getSelectedRangeLast().from.col).toBe(3);
        expect(getSelectedRangeLast().to.row).toBe(3);
        expect(getSelectedRangeLast().to.col).toBe(3);
        expect(`
          |   ║   :   :   : - :   |
          |===:===:===:===:===:===|
          |   ║   :   :   :   :   |
          |   ║   :   :   :   :   |
          |   ║   :   :   :   :   |
          | - ║   :   :   : # :   |
          |   ║   :   :   :   :   |
        `).toBeMatchToSelectionPattern();
      });

      describe('entire column was selected and', () => {
        it('rows at the start had been hidden and were showed', () => {
          handsontable({
            data: Handsontable.helper.createSpreadsheetData(5, 5),
            rowHeaders: true,
            colHeaders: true,
            hiddenRows: {
              rows: [0, 1],
            },
          });

          selectColumns(0);

          getPlugin('hiddenRows').showRows([1]);
          render();

          expect(getSelected()).toEqual([[-1, 0, 4, 0]]);
          expect(getSelectedRangeLast().highlight.row).toBe(1);
          expect(getSelectedRangeLast().highlight.col).toBe(0);
          expect(getSelectedRangeLast().from.row).toBe(-1);
          expect(getSelectedRangeLast().from.col).toBe(0);
          expect(getSelectedRangeLast().to.row).toBe(4);
          expect(getSelectedRangeLast().to.col).toBe(0);
          expect(`
            |   ║ * :   :   :   :   |
            |===:===:===:===:===:===|
            | - ║ A :   :   :   :   |
            | - ║ 0 :   :   :   :   |
            | - ║ 0 :   :   :   :   |
            | - ║ 0 :   :   :   :   |
          `).toBeMatchToSelectionPattern();

          getPlugin('hiddenRows').showRows([0]);
          render();

          expect(getSelected()).toEqual([[-1, 0, 4, 0]]);
          expect(getSelectedRangeLast().highlight.row).toBe(0);
          expect(getSelectedRangeLast().highlight.col).toBe(0);
          expect(getSelectedRangeLast().from.row).toBe(-1);
          expect(getSelectedRangeLast().from.col).toBe(0);
          expect(getSelectedRangeLast().to.row).toBe(4);
          expect(getSelectedRangeLast().to.col).toBe(0);
          expect(`
            |   ║ * :   :   :   :   |
            |===:===:===:===:===:===|
            | - ║ A :   :   :   :   |
            | - ║ 0 :   :   :   :   |
            | - ║ 0 :   :   :   :   |
            | - ║ 0 :   :   :   :   |
            | - ║ 0 :   :   :   :   |
          `).toBeMatchToSelectionPattern();
        });
      });

      it('non-contiguous selection', () => {
        handsontable({
          rowHeaders: true,
          colHeaders: true,
          startRows: 12,
          startCols: 8,
          hiddenRows: {
            rows: [0, 1, 2],
          },
        });

        $(getCell(3, 1)).simulate('mousedown');
        $(getCell(6, 4)).simulate('mouseover').simulate('mouseup');

        keyDown('ctrl');

        $(getCell(5, 3)).simulate('mousedown');
        $(getCell(8, 5)).simulate('mouseover').simulate('mouseup');

        keyDown('ctrl');

        $(getCell(6, 3)).simulate('mousedown');
        $(getCell(9, 6)).simulate('mouseover').simulate('mouseup');

        expect(getSelected()).toEqual([[3, 1, 6, 4], [5, 3, 8, 5], [6, 3, 9, 6]]);
        expect(getSelectedRangeLast().highlight.row).toBe(6);
        expect(getSelectedRangeLast().highlight.col).toBe(3);
        expect(getSelectedRangeLast().from.row).toBe(6);
        expect(getSelectedRangeLast().from.col).toBe(3);
        expect(getSelectedRangeLast().to.row).toBe(9);
        expect(getSelectedRangeLast().to.col).toBe(6);
        expect(`
          |   ║   : - : - : - : - : - : - :   |
          |===:===:===:===:===:===:===:===:===|
          | - ║   : 0 : 0 : 0 : 0 :   :   :   |
          | - ║   : 0 : 0 : 0 : 0 :   :   :   |
          | - ║   : 0 : 0 : 1 : 1 : 0 :   :   |
          | - ║   : 0 : 0 : C : 2 : 1 : 0 :   |
          | - ║   :   :   : 1 : 1 : 1 : 0 :   |
          | - ║   :   :   : 1 : 1 : 1 : 0 :   |
          | - ║   :   :   : 0 : 0 : 0 : 0 :   |
          |   ║   :   :   :   :   :   :   :   |
          |   ║   :   :   :   :   :   :   :   |
        `).toBeMatchToSelectionPattern();

        getPlugin('hiddenRows').showRows([0]);
        render();

        expect(getSelected()).toEqual([[3, 1, 6, 4], [5, 3, 8, 5], [6, 3, 9, 6]]);
        expect(getSelectedRangeLast().highlight.row).toBe(6);
        expect(getSelectedRangeLast().highlight.col).toBe(3);
        expect(getSelectedRangeLast().from.row).toBe(6);
        expect(getSelectedRangeLast().from.col).toBe(3);
        expect(getSelectedRangeLast().to.row).toBe(9);
        expect(getSelectedRangeLast().to.col).toBe(6);
        expect(`
          |   ║   : - : - : - : - : - : - :   |
          |===:===:===:===:===:===:===:===:===|
          |   ║   :   :   :   :   :   :   :   |
          | - ║   : 0 : 0 : 0 : 0 :   :   :   |
          | - ║   : 0 : 0 : 0 : 0 :   :   :   |
          | - ║   : 0 : 0 : 1 : 1 : 0 :   :   |
          | - ║   : 0 : 0 : C : 2 : 1 : 0 :   |
          | - ║   :   :   : 1 : 1 : 1 : 0 :   |
          | - ║   :   :   : 1 : 1 : 1 : 0 :   |
          | - ║   :   :   : 0 : 0 : 0 : 0 :   |
          |   ║   :   :   :   :   :   :   :   |
          |   ║   :   :   :   :   :   :   :   |
        `).toBeMatchToSelectionPattern();

        getPlugin('hiddenRows').showRows([1, 2]);
        render();

        expect(getSelected()).toEqual([[3, 1, 6, 4], [5, 3, 8, 5], [6, 3, 9, 6]]);
        expect(getSelectedRangeLast().highlight.row).toBe(6);
        expect(getSelectedRangeLast().highlight.col).toBe(3);
        expect(getSelectedRangeLast().from.row).toBe(6);
        expect(getSelectedRangeLast().from.col).toBe(3);
        expect(getSelectedRangeLast().to.row).toBe(9);
        expect(getSelectedRangeLast().to.col).toBe(6);
        expect(`
          |   ║   : - : - : - : - : - : - :   |
          |===:===:===:===:===:===:===:===:===|
          |   ║   :   :   :   :   :   :   :   |
          |   ║   :   :   :   :   :   :   :   |
          |   ║   :   :   :   :   :   :   :   |
          | - ║   : 0 : 0 : 0 : 0 :   :   :   |
          | - ║   : 0 : 0 : 0 : 0 :   :   :   |
          | - ║   : 0 : 0 : 1 : 1 : 0 :   :   |
          | - ║   : 0 : 0 : C : 2 : 1 : 0 :   |
          | - ║   :   :   : 1 : 1 : 1 : 0 :   |
          | - ║   :   :   : 1 : 1 : 1 : 0 :   |
          | - ║   :   :   : 0 : 0 : 0 : 0 :   |
          |   ║   :   :   :   :   :   :   :   |
          |   ║   :   :   :   :   :   :   :   |
        `).toBeMatchToSelectionPattern();
      });
    });

    describe('by hiding rows placed before the current selection', () => {
      it('single cell was selected', () => {
        handsontable({
          rowHeaders: true,
          colHeaders: true,
          startRows: 5,
          startCols: 5,
          hiddenRows: true,
        });

        selectCell(3, 3);

        getPlugin('hiddenRows').hideRows([1, 2]);
        render();

        expect(getSelected()).toEqual([[3, 3, 3, 3]]);
        expect(getSelectedRangeLast().highlight.row).toBe(3);
        expect(getSelectedRangeLast().highlight.col).toBe(3);
        expect(getSelectedRangeLast().from.row).toBe(3);
        expect(getSelectedRangeLast().from.col).toBe(3);
        expect(getSelectedRangeLast().to.row).toBe(3);
        expect(getSelectedRangeLast().to.col).toBe(3);
        expect(`
          |   ║   :   :   : - :   |
          |===:===:===:===:===:===|
          |   ║   :   :   :   :   |
          | - ║   :   :   : # :   |
          |   ║   :   :   :   :   |
        `).toBeMatchToSelectionPattern();

        getPlugin('hiddenRows').hideRows([0]);
        render();

        expect(getSelected()).toEqual([[3, 3, 3, 3]]);
        expect(getSelectedRangeLast().highlight.row).toBe(3);
        expect(getSelectedRangeLast().highlight.col).toBe(3);
        expect(getSelectedRangeLast().from.row).toBe(3);
        expect(getSelectedRangeLast().from.col).toBe(3);
        expect(getSelectedRangeLast().to.row).toBe(3);
        expect(getSelectedRangeLast().to.col).toBe(3);
        expect(`
          |   ║   :   :   : - :   |
          |===:===:===:===:===:===|
          | - ║   :   :   : # :   |
          |   ║   :   :   :   :   |
        `).toBeMatchToSelectionPattern();
      });

      it('non-contiguous selection', () => {
        handsontable({
          rowHeaders: true,
          colHeaders: true,
          startRows: 12,
          startCols: 8,
          hiddenRows: true,
        });

        $(getCell(3, 1)).simulate('mousedown');
        $(getCell(6, 4)).simulate('mouseover').simulate('mouseup');

        keyDown('ctrl');

        $(getCell(5, 3)).simulate('mousedown');
        $(getCell(8, 5)).simulate('mouseover').simulate('mouseup');

        keyDown('ctrl');

        $(getCell(6, 3)).simulate('mousedown');
        $(getCell(9, 6)).simulate('mouseover').simulate('mouseup');

        expect(getSelected()).toEqual([[3, 1, 6, 4], [5, 3, 8, 5], [6, 3, 9, 6]]);
        expect(getSelectedRangeLast().highlight.row).toBe(6);
        expect(getSelectedRangeLast().highlight.col).toBe(3);
        expect(getSelectedRangeLast().from.row).toBe(6);
        expect(getSelectedRangeLast().from.col).toBe(3);
        expect(getSelectedRangeLast().to.row).toBe(9);
        expect(getSelectedRangeLast().to.col).toBe(6);
        expect(`
          |   ║   : - : - : - : - : - : - :   |
          |===:===:===:===:===:===:===:===:===|
          |   ║   :   :   :   :   :   :   :   |
          |   ║   :   :   :   :   :   :   :   |
          |   ║   :   :   :   :   :   :   :   |
          | - ║   : 0 : 0 : 0 : 0 :   :   :   |
          | - ║   : 0 : 0 : 0 : 0 :   :   :   |
          | - ║   : 0 : 0 : 1 : 1 : 0 :   :   |
          | - ║   : 0 : 0 : C : 2 : 1 : 0 :   |
          | - ║   :   :   : 1 : 1 : 1 : 0 :   |
          | - ║   :   :   : 1 : 1 : 1 : 0 :   |
          | - ║   :   :   : 0 : 0 : 0 : 0 :   |
          |   ║   :   :   :   :   :   :   :   |
          |   ║   :   :   :   :   :   :   :   |
        `).toBeMatchToSelectionPattern();

        getPlugin('hiddenRows').hideRows([1, 2]);
        render();

        expect(getSelected()).toEqual([[3, 1, 6, 4], [5, 3, 8, 5], [6, 3, 9, 6]]);
        expect(getSelectedRangeLast().highlight.row).toBe(6);
        expect(getSelectedRangeLast().highlight.col).toBe(3);
        expect(getSelectedRangeLast().from.row).toBe(6);
        expect(getSelectedRangeLast().from.col).toBe(3);
        expect(getSelectedRangeLast().to.row).toBe(9);
        expect(getSelectedRangeLast().to.col).toBe(6);
        expect(`
          |   ║   : - : - : - : - : - : - :   |
          |===:===:===:===:===:===:===:===:===|
          |   ║   :   :   :   :   :   :   :   |
          | - ║   : 0 : 0 : 0 : 0 :   :   :   |
          | - ║   : 0 : 0 : 0 : 0 :   :   :   |
          | - ║   : 0 : 0 : 1 : 1 : 0 :   :   |
          | - ║   : 0 : 0 : C : 2 : 1 : 0 :   |
          | - ║   :   :   : 1 : 1 : 1 : 0 :   |
          | - ║   :   :   : 1 : 1 : 1 : 0 :   |
          | - ║   :   :   : 0 : 0 : 0 : 0 :   |
          |   ║   :   :   :   :   :   :   :   |
          |   ║   :   :   :   :   :   :   :   |
        `).toBeMatchToSelectionPattern();

        getPlugin('hiddenRows').hideRows([0]);
        render();

        expect(getSelected()).toEqual([[3, 1, 6, 4], [5, 3, 8, 5], [6, 3, 9, 6]]);
        expect(getSelectedRangeLast().highlight.row).toBe(6);
        expect(getSelectedRangeLast().highlight.col).toBe(3);
        expect(getSelectedRangeLast().from.row).toBe(6);
        expect(getSelectedRangeLast().from.col).toBe(3);
        expect(getSelectedRangeLast().to.row).toBe(9);
        expect(getSelectedRangeLast().to.col).toBe(6);
        expect(`
          |   ║   : - : - : - : - : - : - :   |
          |===:===:===:===:===:===:===:===:===|
          | - ║   : 0 : 0 : 0 : 0 :   :   :   |
          | - ║   : 0 : 0 : 0 : 0 :   :   :   |
          | - ║   : 0 : 0 : 1 : 1 : 0 :   :   |
          | - ║   : 0 : 0 : C : 2 : 1 : 0 :   |
          | - ║   :   :   : 1 : 1 : 1 : 0 :   |
          | - ║   :   :   : 1 : 1 : 1 : 0 :   |
          | - ║   :   :   : 0 : 0 : 0 : 0 :   |
          |   ║   :   :   :   :   :   :   :   |
          |   ║   :   :   :   :   :   :   :   |
        `).toBeMatchToSelectionPattern();
      });
    });

    describe('by showing hidden, ', () => {
      it('selected rows', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(5, 5),
          rowHeaders: true,
          colHeaders: true,
          hiddenRows: {
            rows: [1, 2],
          },
        });

        selectRows(1, 2);

        getPlugin('hiddenRows').showRows([2]);
        render();

        expect(getSelected()).toEqual([[1, -1, 2, 4]]);
        expect(getSelectedRangeLast().highlight.row).toBe(2);
        expect(getSelectedRangeLast().highlight.col).toBe(0);
        expect(getSelectedRangeLast().from.row).toBe(1);
        expect(getSelectedRangeLast().from.col).toBe(-1);
        expect(getSelectedRangeLast().to.row).toBe(2);
        expect(getSelectedRangeLast().to.col).toBe(4);
        expect(`
          |   ║ - : - : - : - : - |
          |===:===:===:===:===:===|
          |   ║   :   :   :   :   |
          | * ║ A : 0 : 0 : 0 : 0 |
          |   ║   :   :   :   :   |
          |   ║   :   :   :   :   |
        `).toBeMatchToSelectionPattern();

        getPlugin('hiddenRows').showRows([1]);
        render();

        expect(getSelected()).toEqual([[1, -1, 2, 4]]);
        expect(getSelectedRangeLast().highlight.row).toBe(1);
        expect(getSelectedRangeLast().highlight.col).toBe(0);
        expect(getSelectedRangeLast().from.row).toBe(1);
        expect(getSelectedRangeLast().from.col).toBe(-1);
        expect(getSelectedRangeLast().to.row).toBe(2);
        expect(getSelectedRangeLast().to.col).toBe(4);
        expect(`
          |   ║ - : - : - : - : - |
          |===:===:===:===:===:===|
          |   ║   :   :   :   :   |
          | * ║ A : 0 : 0 : 0 : 0 |
          | * ║ 0 : 0 : 0 : 0 : 0 |
          |   ║   :   :   :   :   |
          |   ║   :   :   :   :   |
        `).toBeMatchToSelectionPattern();
      });

      it('selected cell', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(5, 5),
          rowHeaders: true,
          colHeaders: true,
          hiddenRows: {
            rows: [1],
          },
        });

        selectCell(1, 3);

        getPlugin('hiddenRows').showRows([1]);
        render();

        expect(getSelected()).toEqual([[1, 3, 1, 3]]);
        expect(getSelectedRangeLast().highlight.row).toBe(1);
        expect(getSelectedRangeLast().highlight.col).toBe(3);
        expect(getSelectedRangeLast().from.row).toBe(1);
        expect(getSelectedRangeLast().from.col).toBe(3);
        expect(getSelectedRangeLast().to.row).toBe(1);
        expect(getSelectedRangeLast().to.col).toBe(3);
        expect(`
          |   ║   :   :   : - :   |
          |===:===:===:===:===:===|
          |   ║   :   :   :   :   |
          | - ║   :   :   : # :   |
          |   ║   :   :   :   :   |
          |   ║   :   :   :   :   |
          |   ║   :   :   :   :   |
        `).toBeMatchToSelectionPattern();
      });

      it('selected cells (just a few)', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(5, 5),
          rowHeaders: true,
          colHeaders: true,
          hiddenRows: {
            rows: [1],
          },
        });

        selectCells([[1, 3], [1, 0], [1, 0]]);

        getPlugin('hiddenRows').showRows([1]);
        render();

        expect(getSelected()).toEqual([[1, 3, 1, 3], [1, 0, 1, 0], [1, 0, 1, 0]]);
        expect(getSelectedRangeLast().highlight.row).toBe(1);
        expect(getSelectedRangeLast().highlight.col).toBe(0);
        expect(getSelectedRangeLast().from.row).toBe(1);
        expect(getSelectedRangeLast().from.col).toBe(0);
        expect(getSelectedRangeLast().to.row).toBe(1);
        expect(getSelectedRangeLast().to.col).toBe(0);
        expect(`
          |   ║ - :   :   : - :   |
          |===:===:===:===:===:===|
          |   ║   :   :   :   :   |
          | - ║ B :   :   : 0 :   |
          |   ║   :   :   :   :   |
          |   ║   :   :   :   :   |
          |   ║   :   :   :   :   |
        `).toBeMatchToSelectionPattern();
      });

      it('selected cells (all of them)', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(5, 5),
          rowHeaders: true,
          colHeaders: true,
          hiddenRows: {
            rows: [0, 1, 2, 3, 4],
          },
        });

        selectAll();

        getPlugin('hiddenRows').showRows([0, 1, 2, 3, 4]);
        render();

        expect(getSelected()).toEqual([[-1, -1, 4, 4]]);
        expect(getSelectedRangeLast().highlight.row).toBe(0);
        expect(getSelectedRangeLast().highlight.col).toBe(0);
        expect(getSelectedRangeLast().from.row).toBe(-1);
        expect(getSelectedRangeLast().from.col).toBe(-1);
        expect(getSelectedRangeLast().to.row).toBe(4);
        expect(getSelectedRangeLast().to.col).toBe(4);
        expect(`
          |   ║ * : * : * : * : * |
          |===:===:===:===:===:===|
          | * ║ A : 0 : 0 : 0 : 0 |
          | * ║ 0 : 0 : 0 : 0 : 0 |
          | * ║ 0 : 0 : 0 : 0 : 0 |
          | * ║ 0 : 0 : 0 : 0 : 0 |
          | * ║ 0 : 0 : 0 : 0 : 0 |
        `).toBeMatchToSelectionPattern();
      });
    });

    it('by showing rows from a selection containing hidden rows at the start and at the end of the range', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenRows: {
          rows: [1, 3],
        },
      });

      selectRows(1, 3);

      getPlugin('hiddenRows').showRows([3]);
      render();

      expect(getSelected()).toEqual([[1, -1, 3, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(2);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(1);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(3);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
        |   ║ - : - : - : - : - |
        |===:===:===:===:===:===|
        |   ║   :   :   :   :   |
        | * ║ A : 0 : 0 : 0 : 0 |
        | * ║ 0 : 0 : 0 : 0 : 0 |
        |   ║   :   :   :   :   |
      `).toBeMatchToSelectionPattern();

      getPlugin('hiddenRows').showRows([1]);
      render();

      expect(getSelected()).toEqual([[1, -1, 3, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(1);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(1);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(3);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
        |   ║ - : - : - : - : - |
        |===:===:===:===:===:===|
        |   ║   :   :   :   :   |
        | * ║ A : 0 : 0 : 0 : 0 |
        | * ║ 0 : 0 : 0 : 0 : 0 |
        | * ║ 0 : 0 : 0 : 0 : 0 |
        |   ║   :   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });

    describe('by hiding ', () => {
      it('selected rows', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(5, 5),
          rowHeaders: true,
          colHeaders: true,
          hiddenRows: true,
        });

        selectRows(1, 2);

        getPlugin('hiddenRows').hideRows([1]);
        render();

        expect(getSelected()).toEqual([[1, -1, 2, 4]]);
        expect(getSelectedRangeLast().highlight.row).toBe(2);
        expect(getSelectedRangeLast().highlight.col).toBe(0);
        expect(getSelectedRangeLast().from.row).toBe(1);
        expect(getSelectedRangeLast().from.col).toBe(-1);
        expect(getSelectedRangeLast().to.row).toBe(2);
        expect(getSelectedRangeLast().to.col).toBe(4);
        expect(`
          |   ║ - : - : - : - : - |
          |===:===:===:===:===:===|
          |   ║   :   :   :   :   |
          | * ║ A : 0 : 0 : 0 : 0 |
          |   ║   :   :   :   :   |
          |   ║   :   :   :   :   |
        `).toBeMatchToSelectionPattern();

        getPlugin('hiddenRows').hideRows([2]);
        render();

        expect(getSelected()).toEqual([[1, -1, 2, 4]]);
        expect(getSelectedRangeLast().highlight.row).toBe(1);
        expect(getSelectedRangeLast().highlight.col).toBe(0);
        expect(getSelectedRangeLast().from.row).toBe(1);
        expect(getSelectedRangeLast().from.col).toBe(-1);
        expect(getSelectedRangeLast().to.row).toBe(2);
        expect(getSelectedRangeLast().to.col).toBe(4);
        expect(`
          |   ║   :   :   :   :   |
          |===:===:===:===:===:===|
          |   ║   :   :   :   :   |
          |   ║   :   :   :   :   |
          |   ║   :   :   :   :   |
        `).toBeMatchToSelectionPattern();
      });

      it('selected cell', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(5, 5),
          rowHeaders: true,
          colHeaders: true,
          hiddenRows: true,
        });

        selectCell(1, 3);

        getPlugin('hiddenRows').hideRows([1]);
        render();

        expect(getSelected()).toEqual([[1, 3, 1, 3]]);
        expect(getSelectedRangeLast().highlight.row).toBe(1);
        expect(getSelectedRangeLast().highlight.col).toBe(3);
        expect(getSelectedRangeLast().from.row).toBe(1);
        expect(getSelectedRangeLast().from.col).toBe(3);
        expect(getSelectedRangeLast().to.row).toBe(1);
        expect(getSelectedRangeLast().to.col).toBe(3);
        expect(`
          |   ║   :   :   :   :   |
          |===:===:===:===:===:===|
          |   ║   :   :   :   :   |
          |   ║   :   :   :   :   |
          |   ║   :   :   :   :   |
          |   ║   :   :   :   :   |
        `).toBeMatchToSelectionPattern();
      });

      it('selected cells', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(5, 5),
          rowHeaders: true,
          colHeaders: true,
          hiddenRows: true,
        });

        selectCells([[1, 3], [1, 0], [1, 0]]);

        getPlugin('hiddenRows').hideRows([1]);
        render();

        expect(getSelected()).toEqual([[1, 3, 1, 3], [1, 0, 1, 0], [1, 0, 1, 0]]);
        expect(getSelectedRangeLast().highlight.row).toBe(1);
        expect(getSelectedRangeLast().highlight.col).toBe(0);
        expect(getSelectedRangeLast().from.row).toBe(1);
        expect(getSelectedRangeLast().from.col).toBe(0);
        expect(getSelectedRangeLast().to.row).toBe(1);
        expect(getSelectedRangeLast().to.col).toBe(0);
        expect(`
          |   ║   :   :   :   :   |
          |===:===:===:===:===:===|
          |   ║   :   :   :   :   |
          |   ║   :   :   :   :   |
          |   ║   :   :   :   :   |
          |   ║   :   :   :   :   |
        `).toBeMatchToSelectionPattern();
      });

      it('all selected cells', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(5, 5),
          rowHeaders: true,
          colHeaders: true,
          hiddenRows: true,
        });

        selectAll();

        getPlugin('hiddenRows').hideRows([0, 1, 2, 3, 4]);
        render();

        expect(getSelected()).toEqual([[-1, -1, 4, 4]]);
        expect(getSelectedRangeLast().highlight.row).toBe(0);
        expect(getSelectedRangeLast().highlight.col).toBe(0);
        expect(getSelectedRangeLast().from.row).toBe(-1);
        expect(getSelectedRangeLast().from.col).toBe(-1);
        expect(getSelectedRangeLast().to.row).toBe(4);
        expect(getSelectedRangeLast().to.col).toBe(4);
        expect(`
          |   | * : * : * : * : * |
          |===:===:===:===:===:===|
        `).toBeMatchToSelectionPattern();
      });
    });

    it('showed rows on a table with all rows hidden and with selected entire column', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenRows: {
          rows: [0, 1, 2, 3, 4],
        },
      });

      selectColumns(0);

      getPlugin('hiddenRows').showRows([4]);
      render();

      expect(getSelected()).toEqual([[-1, 0, 4, 0]]);
      expect(getSelectedRangeLast().highlight.row).toBe(4);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(0);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(0);
      expect(`
        |   ║ * :   :   :   :   |
        |===:===:===:===:===:===|
        | - ║ A :   :   :   :   |
      `).toBeMatchToSelectionPattern();

      getPlugin('hiddenRows').showRows([1, 2, 3]);
      render();

      expect(getSelected()).toEqual([[-1, 0, 4, 0]]);
      expect(getSelectedRangeLast().highlight.row).toBe(1);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(0);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(0);
      expect(`
        |   ║ * :   :   :   :   |
        |===:===:===:===:===:===|
        | - ║ A :   :   :   :   |
        | - ║ 0 :   :   :   :   |
        | - ║ 0 :   :   :   :   |
        | - ║ 0 :   :   :   :   |
      `).toBeMatchToSelectionPattern();

      getPlugin('hiddenRows').showRows([0]);
      render();

      expect(getSelected()).toEqual([[-1, 0, 4, 0]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(0);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(0);
      expect(`
        |   ║ * :   :   :   :   |
        |===:===:===:===:===:===|
        | - ║ A :   :   :   :   |
        | - ║ 0 :   :   :   :   |
        | - ║ 0 :   :   :   :   |
        | - ║ 0 :   :   :   :   |
        | - ║ 0 :   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });
  });
});
