describe('HiddenColumns', () => {
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
        hiddenColumns: {
          columns: [0],
        },
      });

      const header = getCell(0, -1);

      simulateClick(header, 'LMB');

      expect(getSelected()).toEqual([[0, -1, 0, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(1);
      expect(getSelectedRangeLast().from.row).toBe(0);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(0);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
      |   ║ - : - : - : - |
      |===:===:===:===:===|
      | * ║ A : 0 : 0 : 0 |
      |   ║   :   :   :   |
      |   ║   :   :   :   |
      |   ║   :   :   :   |
      |   ║   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select entire row by header if last column is hidden', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [4],
        },
      });

      const header = getCell(0, -1);

      simulateClick(header, 'LMB');

      expect(getSelected()).toEqual([[0, -1, 0, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(0);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(0);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
      |   ║ - : - : - : - |
      |===:===:===:===:===|
      | * ║ A : 0 : 0 : 0 |
      |   ║   :   :   :   |
      |   ║   :   :   :   |
      |   ║   :   :   :   |
      |   ║   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select entire row by header if any column in the middle is hidden', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [1, 2, 3],
        },
      });

      const header = getCell(0, -1);

      simulateClick(header, 'LMB');

      expect(getSelected()).toEqual([[0, -1, 0, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(0);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(0);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
      |   ║ - : - |
      |===:===:===|
      | * ║ A : 0 |
      |   ║   :   |
      |   ║   :   |
      |   ║   :   |
      |   ║   :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select entire row by header if all columns are hidden', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [0, 1, 2, 3, 4],
        },
      });

      const header = $('.ht_clone_left .htCore')
        .find('tbody')
        .find('th')
        .eq(0);
      simulateClick(header, 'LMB');

      expect(getSelected()).toEqual([[0, -1, 0, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(0);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(0);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
      |   |
      |===|
      | * |
      |   |
      |   |
      |   |
      |   |
      `).toBeMatchToSelectionPattern();
    });

    it('should keep hidden columns in cell range', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [1, 2, 3],
        },
      });

      const startCell = getCell(0, 0);
      const endCell = getCell(0, 4);

      mouseDown(startCell, 'LMB');
      mouseOver(endCell);
      mouseUp(endCell);

      expect(getSelected()).toEqual([[0, 0, 0, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(0);
      expect(getSelectedRangeLast().from.col).toBe(0);
      expect(getSelectedRangeLast().to.row).toBe(0);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
      |   ║ - : - |
      |===:===:===|
      | - ║ A : 0 |
      |   ║   :   |
      |   ║   :   |
      |   ║   :   |
      |   ║   :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select non-contiguous columns properly when there are some hidden columns', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 8),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [0, 1],
        },
      });

      const startColumn = getCell(-1, 4);
      const endColumn = getCell(-1, 6);

      mouseDown(startColumn, 'LMB');
      mouseUp(startColumn);

      keyDown('ctrl');

      mouseDown(endColumn, 'LMB');
      mouseUp(endColumn);

      keyUp('ctrl');

      expect(getSelected()).toEqual([
        [-1, 4, 4, 4],
        [-1, 6, 4, 6],
      ]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(6);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(6);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(6);
      expect(`
      |   ║   :   : * :   : * :   |
      |===:===:===:===:===:===:===|
      | - ║   :   : 0 :   : A :   |
      | - ║   :   : 0 :   : 0 :   |
      | - ║   :   : 0 :   : 0 :   |
      | - ║   :   : 0 :   : 0 :   |
      | - ║   :   : 0 :   : 0 :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select cells by using two layers when CTRL key is pressed and some columns are hidden', () => {
      handsontable({
        rowHeaders: true,
        colHeaders: true,
        startRows: 8,
        startCols: 12,
        hiddenColumns: {
          columns: [0, 1],
        },
      });

      $(getCell(1, 3)).simulate('mousedown');
      $(getCell(4, 6)).simulate('mouseover');
      $(getCell(4, 6)).simulate('mouseup');

      expect(getSelected()).toEqual([[1, 3, 4, 6]]);
      expect(getSelectedRangeLast().highlight.row).toBe(1);
      expect(getSelectedRangeLast().highlight.col).toBe(3);
      expect(getSelectedRangeLast().from.row).toBe(1);
      expect(getSelectedRangeLast().from.col).toBe(3);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(6);
      expect(`
      |   ║   : - : - : - : - :   :   :   :   :   |
      |===:===:===:===:===:===:===:===:===:===:===|
      |   ║   :   :   :   :   :   :   :   :   :   |
      | - ║   : A : 0 : 0 : 0 :   :   :   :   :   |
      | - ║   : 0 : 0 : 0 : 0 :   :   :   :   :   |
      | - ║   : 0 : 0 : 0 : 0 :   :   :   :   :   |
      | - ║   : 0 : 0 : 0 : 0 :   :   :   :   :   |
      |   ║   :   :   :   :   :   :   :   :   :   |
      |   ║   :   :   :   :   :   :   :   :   :   |
      |   ║   :   :   :   :   :   :   :   :   :   |
      `).toBeMatchToSelectionPattern();

      keyDown('ctrl');

      $(getCell(3, 5)).simulate('mousedown');
      $(getCell(5, 8)).simulate('mouseover');
      $(getCell(5, 8)).simulate('mouseup');

      expect(getSelected()).toEqual([[1, 3, 4, 6], [3, 5, 5, 8]]);
      expect(getSelectedRangeLast().highlight.row).toBe(3);
      expect(getSelectedRangeLast().highlight.col).toBe(5);
      expect(getSelectedRangeLast().from.row).toBe(3);
      expect(getSelectedRangeLast().from.col).toBe(5);
      expect(getSelectedRangeLast().to.row).toBe(5);
      expect(getSelectedRangeLast().to.col).toBe(8);
      expect(`
      |   ║   : - : - : - : - : - : - :   :   :   |
      |===:===:===:===:===:===:===:===:===:===:===|
      |   ║   :   :   :   :   :   :   :   :   :   |
      | - ║   : 0 : 0 : 0 : 0 :   :   :   :   :   |
      | - ║   : 0 : 0 : 0 : 0 :   :   :   :   :   |
      | - ║   : 0 : 0 : B : 1 : 0 : 0 :   :   :   |
      | - ║   : 0 : 0 : 1 : 1 : 0 : 0 :   :   :   |
      | - ║   :   :   : 0 : 0 : 0 : 0 :   :   :   |
      |   ║   :   :   :   :   :   :   :   :   :   |
      |   ║   :   :   :   :   :   :   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });

    describe('should select entire table after the corner was clicked and', () => {
      it('just some columns were hidden', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(5, 5),
          rowHeaders: true,
          colHeaders: true,
          hiddenColumns: {
            columns: [0, 1, 2],
          },
        });

        const corner = $('.ht_clone_top_left_corner .htCore')
          .find('thead')
          .find('th')
          .eq(0);
        simulateClick(corner, 'LMB');

        expect(getSelected()).toEqual([[-1, -1, 4, 4]]);
        expect(getSelectedRangeLast().highlight.row).toBe(0);
        expect(getSelectedRangeLast().highlight.col).toBe(3); // Corner (col) is shifted to renderable index.
        expect(getSelectedRangeLast().from.row).toBe(-1);
        expect(getSelectedRangeLast().from.col).toBe(-1);
        expect(getSelectedRangeLast().to.row).toBe(4);
        expect(getSelectedRangeLast().to.col).toBe(4);
        expect(`
        |   ║ * : * |
        |===:===:===|
        | * ║ A : 0 |
        | * ║ 0 : 0 |
        | * ║ 0 : 0 |
        | * ║ 0 : 0 |
        | * ║ 0 : 0 |
        `).toBeMatchToSelectionPattern();
      });

      it('all columns were hidden', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(5, 5),
          rowHeaders: true,
          colHeaders: true,
          hiddenColumns: {
            columns: [0, 1, 2, 3, 4],
          },
        });

        const corner = $('.ht_clone_top_left_corner .htCore')
          .find('thead')
          .find('th')
          .eq(0);
        simulateClick(corner, 'LMB');

        expect(getSelected()).toEqual([[-1, -1, 4, 4]]);
        expect(getSelectedRangeLast().highlight.row).toBe(0);
        expect(getSelectedRangeLast().highlight.col).toBe(0);
        expect(getSelectedRangeLast().from.row).toBe(-1);
        expect(getSelectedRangeLast().from.col).toBe(-1);
        expect(getSelectedRangeLast().to.row).toBe(4);
        expect(getSelectedRangeLast().to.col).toBe(4);
        expect(`
        |   |
        |===|
        | * |
        | * |
        | * |
        | * |
        | * |
        `).toBeMatchToSelectionPattern();
      });
    });
  });

  describe('cell selection (API)', () => {
    // Do we need this test case?
    it('should not throw any errors, when selecting a whole row with the last column hidden', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(4, 4),
        hiddenColumns: {
          columns: [3]
        },
        rowHeaders: true,
      });

      let errorThrown = false;

      try {
        hot.selectCell(2, 0, 2, 3);

      } catch (err) {
        errorThrown = true;
      }

      expect(errorThrown).toBe(false);
    });

    it('should highlight a proper headers when selection contains hidden columns', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [1, 2],
        },
      });

      selectCells([[1, 0, 2, 3]]);

      expect(getSelected()).toEqual([[1, 0, 2, 3]]);
      expect(getSelectedRangeLast().highlight.row).toBe(1);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(1);
      expect(getSelectedRangeLast().from.col).toBe(0);
      expect(getSelectedRangeLast().to.row).toBe(2);
      expect(getSelectedRangeLast().to.col).toBe(3);
      expect(`
        |   ║ - : - :   |
        |===:===:===:===|
        |   ║   :   :   |
        | - ║ A : 0 :   |
        | - ║ 0 : 0 :   |
        |   ║   :   :   |
        |   ║   :   :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should highlight a row header when all columns are hidden and selected cell is hidden', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [0, 1, 2, 3, 4],
        },
      });

      selectCell(0, 0);

      expect(getSelected()).toEqual([[0, 0, 0, 0]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(0);
      expect(getSelectedRangeLast().from.col).toBe(0);
      expect(getSelectedRangeLast().to.row).toBe(0);
      expect(getSelectedRangeLast().to.col).toBe(0);
      expect(`
        |   |
        |===|
        | - |
        |   |
        |   |
        |   |
        |   |
      `).toBeMatchToSelectionPattern();

      selectCell(2, 1);

      expect(getSelected()).toEqual([[2, 1, 2, 1]]);
      expect(getSelectedRangeLast().highlight.row).toBe(2);
      expect(getSelectedRangeLast().highlight.col).toBe(1);
      expect(getSelectedRangeLast().from.row).toBe(2);
      expect(getSelectedRangeLast().from.col).toBe(1);
      expect(getSelectedRangeLast().to.row).toBe(2);
      expect(getSelectedRangeLast().to.col).toBe(1);
      expect(`
        |   |
        |===|
        |   |
        |   |
        | - |
        |   |
        |   |
      `).toBeMatchToSelectionPattern();
    });

    it('should highlight a row header when all columns are hidden and selected cell is hidden', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [0, 1, 2, 3, 4],
        },
      });

      selectCell(0, 0);

      expect(getSelected()).toEqual([[0, 0, 0, 0]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(0);
      expect(getSelectedRangeLast().from.col).toBe(0);
      expect(getSelectedRangeLast().to.row).toBe(0);
      expect(getSelectedRangeLast().to.col).toBe(0);
      expect(`
        |   |
        |===|
        | - |
        |   |
        |   |
        |   |
        |   |
      `).toBeMatchToSelectionPattern();

      selectCell(2, 1);

      expect(getSelected()).toEqual([[2, 1, 2, 1]]);
      expect(getSelectedRangeLast().highlight.row).toBe(2);
      expect(getSelectedRangeLast().highlight.col).toBe(1);
      expect(getSelectedRangeLast().from.row).toBe(2);
      expect(getSelectedRangeLast().from.col).toBe(1);
      expect(getSelectedRangeLast().to.row).toBe(2);
      expect(getSelectedRangeLast().to.col).toBe(1);
      expect(`
        |   |
        |===|
        |   |
        |   |
        | - |
        |   |
        |   |
      `).toBeMatchToSelectionPattern();
    });

    it('should highlight a row header when all columns are hidden and selected cell is hidden (`single` selection mode)', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        selectionMode: 'single',
        hiddenColumns: {
          columns: [0, 1, 2, 3, 4],
        },
      });

      selectCell(0, 0);

      expect(getSelected()).toEqual([[0, 0, 0, 0]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(0);
      expect(getSelectedRangeLast().from.col).toBe(0);
      expect(getSelectedRangeLast().to.row).toBe(0);
      expect(getSelectedRangeLast().to.col).toBe(0);
      expect(`
        |   |
        |===|
        | - |
        |   |
        |   |
        |   |
        |   |
      `).toBeMatchToSelectionPattern();

      selectCell(2, 1);

      expect(getSelected()).toEqual([[2, 1, 2, 1]]);
      expect(getSelectedRangeLast().highlight.row).toBe(2);
      expect(getSelectedRangeLast().highlight.col).toBe(1);
      expect(getSelectedRangeLast().from.row).toBe(2);
      expect(getSelectedRangeLast().from.col).toBe(1);
      expect(getSelectedRangeLast().to.row).toBe(2);
      expect(getSelectedRangeLast().to.col).toBe(1);
      expect(`
        |   |
        |===|
        |   |
        |   |
        | - |
        |   |
        |   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select entire table after call selectAll if some columns are hidden', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [0, 1],
        },
      });

      selectAll();

      expect(getSelected()).toEqual([[-1, -1, 4, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(2);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
      |   ║ * : * : * |
      |===:===:===:===|
      | * ║ A : 0 : 0 |
      | * ║ 0 : 0 : 0 |
      | * ║ 0 : 0 : 0 |
      | * ║ 0 : 0 : 0 |
      | * ║ 0 : 0 : 0 |
      `).toBeMatchToSelectionPattern();
    });

    it('should select entire table after call selectAll if all of columns are hidden', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [0, 1, 2, 3, 4],
        },
      });

      selectAll();

      expect(getSelected()).toEqual([[-1, -1, 4, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0); // a fallback to 0
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
      |   |
      |===|
      | * |
      | * |
      | * |
      | * |
      | * |
      `).toBeMatchToSelectionPattern();
    });

    it('should select entire row after call selectRows if the first column is hidden', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [0],
        },
      });

      selectRows(0);

      expect(getSelected()).toEqual([[0, -1, 0, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(1);
      expect(getSelectedRangeLast().from.row).toBe(0);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(0);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
      |   ║ - : - : - : - |
      |===:===:===:===:===|
      | * ║ A : 0 : 0 : 0 |
      |   ║   :   :   :   |
      |   ║   :   :   :   |
      |   ║   :   :   :   |
      |   ║   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select entire row after call selectRows if the last column is hidden', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [4],
        },
      });

      selectRows(0);

      expect(getSelected()).toEqual([[0, -1, 0, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(0);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(0);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
      |   ║ - : - : - : - |
      |===:===:===:===:===|
      | * ║ A : 0 : 0 : 0 |
      |   ║   :   :   :   |
      |   ║   :   :   :   |
      |   ║   :   :   :   |
      |   ║   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select entire row after call selectRows if columns between the first and the last are hidden', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [1, 2, 3],
        },
      });

      selectRows(0);

      expect(getSelected()).toEqual([[0, -1, 0, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(0);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(0);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
      |   ║ - : - |
      |===:===:===|
      | * ║ A : 0 |
      |   ║   :   |
      |   ║   :   |
      |   ║   :   |
      |   ║   :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select hidden column internally after the `selectColumns` call', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [1],
        },
      });

      selectColumns(1);

      expect(getSelected()).toEqual([[-1, 1, 4, 1]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(1); // a fallback to 1
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(1);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(1);
      expect(`
      |   ║   :   :   :   |
      |===:===:===:===:===|
      | - ║   :   :   :   |
      | - ║   :   :   :   |
      | - ║   :   :   :   |
      | - ║   :   :   :   |
      | - ║   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select columns after the `selectColumns` call if range is partially hidden at the beginning of selection #1', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [1, 2, 3],
        },
      });

      selectColumns(1, 4);

      expect(getSelected()).toEqual([[-1, 1, 4, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(4);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(1);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
      |   ║   : * |
      |===:===:===|
      | - ║   : A |
      | - ║   : 0 |
      | - ║   : 0 |
      | - ║   : 0 |
      | - ║   : 0 |
      `).toBeMatchToSelectionPattern();
    });

    it('should select columns after the `selectColumns` call if range is partially hidden at the beginning of selection #2', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [1, 2, 3],
        },
      });

      selectColumns(2, 4);

      expect(getSelected()).toEqual([[-1, 2, 4, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(4);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(2);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
      |   ║   : * |
      |===:===:===|
      | - ║   : A |
      | - ║   : 0 |
      | - ║   : 0 |
      | - ║   : 0 |
      | - ║   : 0 |
      `).toBeMatchToSelectionPattern();
    });

    it('should select columns after the `selectColumns` call if range is partially hidden at the end of selection #1', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [1, 2, 3],
        },
      });

      selectColumns(0, 2);

      expect(getSelected()).toEqual([[-1, 0, 4, 2]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(0);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(2);
      expect(`
      |   ║ * :   |
      |===:===:===|
      | - ║ A :   |
      | - ║ 0 :   |
      | - ║ 0 :   |
      | - ║ 0 :   |
      | - ║ 0 :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select columns after the `selectColumns` call if range is partially hidden at the end of selection #2', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [1, 2, 3],
        },
      });

      selectColumns(0, 3);

      expect(getSelected()).toEqual([[-1, 0, 4, 3]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(0);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(3);
      expect(`
      |   ║ * :   |
      |===:===:===|
      | - ║ A :   |
      | - ║ 0 :   |
      | - ║ 0 :   |
      | - ║ 0 :   |
      | - ║ 0 :   |
      `).toBeMatchToSelectionPattern();
    });

    it('should select columns after call selectColumns if range is partially hidden in the middle of selection', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [1, 2, 3],
        },
      });

      selectColumns(0, 4);

      expect(getSelected()).toEqual([[-1, 0, 4, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(0);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
      |   ║ * : * |
      |===:===:===|
      | - ║ A : 0 |
      | - ║ 0 : 0 |
      | - ║ 0 : 0 |
      | - ║ 0 : 0 |
      | - ║ 0 : 0 |
      `).toBeMatchToSelectionPattern();
    });

    it('should select columns after call selectColumns if range is partially hidden at the start and at the end of the range', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [1, 3],
        },
      });

      selectColumns(1, 3);

      expect(getSelected()).toEqual([[-1, 1, 4, 3]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(2);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(1);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(3);
      expect(`
      |   ║   : * :   |
      |===:===:===:===|
      | - ║   : A :   |
      | - ║   : 0 :   |
      | - ║   : 0 :   |
      | - ║   : 0 :   |
      | - ║   : 0 :   |
      `).toBeMatchToSelectionPattern();
    });
  });

  describe('redrawing rendered selection when the selected range has been changed', () => {
    describe('by showing columns placed before the current selection', () => {
      it('single cell was selected', () => {
        handsontable({
          rowHeaders: true,
          colHeaders: true,
          startRows: 5,
          startCols: 5,
          hiddenColumns: {
            columns: [0, 1, 2],
          },
        });

        selectCell(3, 3);

        getPlugin('hiddenColumns').showColumns([0]);
        render();

        expect(getSelected()).toEqual([[3, 3, 3, 3]]);
        expect(getSelectedRangeLast().highlight.row).toBe(3);
        expect(getSelectedRangeLast().highlight.col).toBe(3);
        expect(getSelectedRangeLast().from.row).toBe(3);
        expect(getSelectedRangeLast().from.col).toBe(3);
        expect(getSelectedRangeLast().to.row).toBe(3);
        expect(getSelectedRangeLast().to.col).toBe(3);
        expect(`
        |   ║   : - :   |
        |===:===:===:===|
        |   ║   :   :   |
        |   ║   :   :   |
        |   ║   :   :   |
        | - ║   : # :   |
        |   ║   :   :   |
        `).toBeMatchToSelectionPattern();

        getPlugin('hiddenColumns').showColumns([1, 2]);
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

      describe('entire row was selected and', () => {
        it('columns at the start had been hidden and were showed', () => {
          handsontable({
            data: Handsontable.helper.createSpreadsheetData(5, 5),
            rowHeaders: true,
            colHeaders: true,
            hiddenColumns: {
              columns: [0, 1],
            },
          });

          selectRows(0);

          getPlugin('hiddenColumns').showColumns([1]);
          render();

          expect(getSelected()).toEqual([[0, -1, 0, 4]]);
          expect(getSelectedRangeLast().highlight.row).toBe(0);
          expect(getSelectedRangeLast().highlight.col).toBe(1);
          expect(getSelectedRangeLast().from.row).toBe(0);
          expect(getSelectedRangeLast().from.col).toBe(-1);
          expect(getSelectedRangeLast().to.row).toBe(0);
          expect(getSelectedRangeLast().to.col).toBe(4);
          expect(`
          |   ║ - : - : - : - |
          |===:===:===:===:===|
          | * ║ A : 0 : 0 : 0 |
          |   ║   :   :   :   |
          |   ║   :   :   :   |
          |   ║   :   :   :   |
          |   ║   :   :   :   |
          `).toBeMatchToSelectionPattern();

          getPlugin('hiddenColumns').showColumns([0]);
          render();

          expect(getSelected()).toEqual([[0, -1, 0, 4]]);
          expect(getSelectedRangeLast().highlight.row).toBe(0);
          expect(getSelectedRangeLast().highlight.col).toBe(0);
          expect(getSelectedRangeLast().from.row).toBe(0);
          expect(getSelectedRangeLast().from.col).toBe(-1);
          expect(getSelectedRangeLast().to.row).toBe(0);
          expect(getSelectedRangeLast().to.col).toBe(4);
          expect(`
          |   ║ - : - : - : - : - |
          |===:===:===:===:===:===|
          | * ║ A : 0 : 0 : 0 : 0 |
          |   ║   :   :   :   :   |
          |   ║   :   :   :   :   |
          |   ║   :   :   :   :   |
          |   ║   :   :   :   :   |
          `).toBeMatchToSelectionPattern();
        });
      });

      it('non-contiguous selection', () => {
        handsontable({
          rowHeaders: true,
          colHeaders: true,
          startRows: 8,
          startCols: 12,
          hiddenColumns: {
            columns: [0, 1, 2],
          },
        });

        $(getCell(1, 3)).simulate('mousedown');
        $(getCell(4, 6)).simulate('mouseover');
        $(getCell(4, 6)).simulate('mouseup');

        keyDown('ctrl');

        $(getCell(3, 5)).simulate('mousedown');
        $(getCell(5, 8)).simulate('mouseover');
        $(getCell(5, 8)).simulate('mouseup');

        keyDown('ctrl');

        $(getCell(3, 6)).simulate('mousedown');
        $(getCell(6, 9)).simulate('mouseover');
        $(getCell(6, 9)).simulate('mouseup');

        expect(getSelected()).toEqual([[1, 3, 4, 6], [3, 5, 5, 8], [3, 6, 6, 9]]);
        expect(getSelectedRangeLast().highlight.row).toBe(3);
        expect(getSelectedRangeLast().highlight.col).toBe(6);
        expect(getSelectedRangeLast().from.row).toBe(3);
        expect(getSelectedRangeLast().from.col).toBe(6);
        expect(getSelectedRangeLast().to.row).toBe(6);
        expect(getSelectedRangeLast().to.col).toBe(9);
        expect(`
        |   ║ - : - : - : - : - : - : - :   :   |
        |===:===:===:===:===:===:===:===:===:===|
        |   ║   :   :   :   :   :   :   :   :   |
        | - ║ 0 : 0 : 0 : 0 :   :   :   :   :   |
        | - ║ 0 : 0 : 0 : 0 :   :   :   :   :   |
        | - ║ 0 : 0 : 1 : C : 1 : 1 : 0 :   :   |
        | - ║ 0 : 0 : 1 : 2 : 1 : 1 : 0 :   :   |
        | - ║   :   : 0 : 1 : 1 : 1 : 0 :   :   |
        | - ║   :   :   : 0 : 0 : 0 : 0 :   :   |
        |   ║   :   :   :   :   :   :   :   :   |
        `).toBeMatchToSelectionPattern();

        getPlugin('hiddenColumns').showColumns([0]);
        render();

        expect(getSelected()).toEqual([[1, 3, 4, 6], [3, 5, 5, 8], [3, 6, 6, 9]]);
        expect(getSelectedRangeLast().highlight.row).toBe(3);
        expect(getSelectedRangeLast().highlight.col).toBe(6);
        expect(getSelectedRangeLast().from.row).toBe(3);
        expect(getSelectedRangeLast().from.col).toBe(6);
        expect(getSelectedRangeLast().to.row).toBe(6);
        expect(getSelectedRangeLast().to.col).toBe(9);
        expect(`
        |   ║   : - : - : - : - : - : - : - :   :   |
        |===:===:===:===:===:===:===:===:===:===:===|
        |   ║   :   :   :   :   :   :   :   :   :   |
        | - ║   : 0 : 0 : 0 : 0 :   :   :   :   :   |
        | - ║   : 0 : 0 : 0 : 0 :   :   :   :   :   |
        | - ║   : 0 : 0 : 1 : C : 1 : 1 : 0 :   :   |
        | - ║   : 0 : 0 : 1 : 2 : 1 : 1 : 0 :   :   |
        | - ║   :   :   : 0 : 1 : 1 : 1 : 0 :   :   |
        | - ║   :   :   :   : 0 : 0 : 0 : 0 :   :   |
        |   ║   :   :   :   :   :   :   :   :   :   |
        `).toBeMatchToSelectionPattern();

        getPlugin('hiddenColumns').showColumns([1, 2]);
        render();

        expect(getSelected()).toEqual([[1, 3, 4, 6], [3, 5, 5, 8], [3, 6, 6, 9]]);
        expect(getSelectedRangeLast().highlight.row).toBe(3);
        expect(getSelectedRangeLast().highlight.col).toBe(6);
        expect(getSelectedRangeLast().from.row).toBe(3);
        expect(getSelectedRangeLast().from.col).toBe(6);
        expect(getSelectedRangeLast().to.row).toBe(6);
        expect(getSelectedRangeLast().to.col).toBe(9);
        expect(`
        |   ║   :   :   : - : - : - : - : - : - : - :   :   |
        |===:===:===:===:===:===:===:===:===:===:===:===:===|
        |   ║   :   :   :   :   :   :   :   :   :   :   :   |
        | - ║   :   :   : 0 : 0 : 0 : 0 :   :   :   :   :   |
        | - ║   :   :   : 0 : 0 : 0 : 0 :   :   :   :   :   |
        | - ║   :   :   : 0 : 0 : 1 : C : 1 : 1 : 0 :   :   |
        | - ║   :   :   : 0 : 0 : 1 : 2 : 1 : 1 : 0 :   :   |
        | - ║   :   :   :   :   : 0 : 1 : 1 : 1 : 0 :   :   |
        | - ║   :   :   :   :   :   : 0 : 0 : 0 : 0 :   :   |
        |   ║   :   :   :   :   :   :   :   :   :   :   :   |
        `).toBeMatchToSelectionPattern();
      });
    });

    describe('by hiding columns placed before the current selection', () => {
      it('single cell was selected', () => {
        handsontable({
          rowHeaders: true,
          colHeaders: true,
          startRows: 5,
          startCols: 5,
          hiddenColumns: true,
        });

        selectCell(3, 3);

        getPlugin('hiddenColumns').hideColumns([1, 2]);
        render();

        expect(getSelected()).toEqual([[3, 3, 3, 3]]);
        expect(getSelectedRangeLast().highlight.row).toBe(3);
        expect(getSelectedRangeLast().highlight.col).toBe(3);
        expect(getSelectedRangeLast().from.row).toBe(3);
        expect(getSelectedRangeLast().from.col).toBe(3);
        expect(getSelectedRangeLast().to.row).toBe(3);
        expect(getSelectedRangeLast().to.col).toBe(3);
        expect(`
        |   ║   : - :   |
        |===:===:===:===|
        |   ║   :   :   |
        |   ║   :   :   |
        |   ║   :   :   |
        | - ║   : # :   |
        |   ║   :   :   |
        `).toBeMatchToSelectionPattern();

        getPlugin('hiddenColumns').hideColumns([0]);
        render();

        expect(getSelected()).toEqual([[3, 3, 3, 3]]);
        expect(getSelectedRangeLast().highlight.row).toBe(3);
        expect(getSelectedRangeLast().highlight.col).toBe(3);
        expect(getSelectedRangeLast().from.row).toBe(3);
        expect(getSelectedRangeLast().from.col).toBe(3);
        expect(getSelectedRangeLast().to.row).toBe(3);
        expect(getSelectedRangeLast().to.col).toBe(3);
        expect(`
        |   ║ - :   |
        |===:===:===|
        |   ║   :   |
        |   ║   :   |
        |   ║   :   |
        | - ║ # :   |
        |   ║   :   |
        `).toBeMatchToSelectionPattern();
      });

      it('non-contiguous selection', () => {
        handsontable({
          rowHeaders: true,
          colHeaders: true,
          startRows: 8,
          startCols: 12,
          hiddenColumns: true,
        });

        $(getCell(1, 3)).simulate('mousedown');
        $(getCell(4, 6)).simulate('mouseover');
        $(getCell(4, 6)).simulate('mouseup');

        keyDown('ctrl');

        $(getCell(3, 5)).simulate('mousedown');
        $(getCell(5, 8)).simulate('mouseover');
        $(getCell(5, 8)).simulate('mouseup');

        keyDown('ctrl');

        $(getCell(3, 6)).simulate('mousedown');
        $(getCell(6, 9)).simulate('mouseover');
        $(getCell(6, 9)).simulate('mouseup');

        expect(getSelected()).toEqual([[1, 3, 4, 6], [3, 5, 5, 8], [3, 6, 6, 9]]);
        expect(getSelectedRangeLast().highlight.row).toBe(3);
        expect(getSelectedRangeLast().highlight.col).toBe(6);
        expect(getSelectedRangeLast().from.row).toBe(3);
        expect(getSelectedRangeLast().from.col).toBe(6);
        expect(getSelectedRangeLast().to.row).toBe(6);
        expect(getSelectedRangeLast().to.col).toBe(9);
        expect(`
        |   ║   :   :   : - : - : - : - : - : - : - :   :   |
        |===:===:===:===:===:===:===:===:===:===:===:===:===|
        |   ║   :   :   :   :   :   :   :   :   :   :   :   |
        | - ║   :   :   : 0 : 0 : 0 : 0 :   :   :   :   :   |
        | - ║   :   :   : 0 : 0 : 0 : 0 :   :   :   :   :   |
        | - ║   :   :   : 0 : 0 : 1 : C : 1 : 1 : 0 :   :   |
        | - ║   :   :   : 0 : 0 : 1 : 2 : 1 : 1 : 0 :   :   |
        | - ║   :   :   :   :   : 0 : 1 : 1 : 1 : 0 :   :   |
        | - ║   :   :   :   :   :   : 0 : 0 : 0 : 0 :   :   |
        |   ║   :   :   :   :   :   :   :   :   :   :   :   |
        `).toBeMatchToSelectionPattern();

        getPlugin('hiddenColumns').hideColumns([1, 2]);
        render();

        expect(getSelected()).toEqual([[1, 3, 4, 6], [3, 5, 5, 8], [3, 6, 6, 9]]);
        expect(getSelectedRangeLast().highlight.row).toBe(3);
        expect(getSelectedRangeLast().highlight.col).toBe(6);
        expect(getSelectedRangeLast().from.row).toBe(3);
        expect(getSelectedRangeLast().from.col).toBe(6);
        expect(getSelectedRangeLast().to.row).toBe(6);
        expect(getSelectedRangeLast().to.col).toBe(9);
        expect(`
        |   ║   : - : - : - : - : - : - : - :   :   |
        |===:===:===:===:===:===:===:===:===:===:===|
        |   ║   :   :   :   :   :   :   :   :   :   |
        | - ║   : 0 : 0 : 0 : 0 :   :   :   :   :   |
        | - ║   : 0 : 0 : 0 : 0 :   :   :   :   :   |
        | - ║   : 0 : 0 : 1 : C : 1 : 1 : 0 :   :   |
        | - ║   : 0 : 0 : 1 : 2 : 1 : 1 : 0 :   :   |
        | - ║   :   :   : 0 : 1 : 1 : 1 : 0 :   :   |
        | - ║   :   :   :   : 0 : 0 : 0 : 0 :   :   |
        |   ║   :   :   :   :   :   :   :   :   :   |
        `).toBeMatchToSelectionPattern();

        getPlugin('hiddenColumns').hideColumns([0]);
        render();

        expect(getSelected()).toEqual([[1, 3, 4, 6], [3, 5, 5, 8], [3, 6, 6, 9]]);
        expect(getSelectedRangeLast().highlight.row).toBe(3);
        expect(getSelectedRangeLast().highlight.col).toBe(6);
        expect(getSelectedRangeLast().from.row).toBe(3);
        expect(getSelectedRangeLast().from.col).toBe(6);
        expect(getSelectedRangeLast().to.row).toBe(6);
        expect(getSelectedRangeLast().to.col).toBe(9);
        expect(`
        |   ║ - : - : - : - : - : - : - :   :   |
        |===:===:===:===:===:===:===:===:===:===|
        |   ║   :   :   :   :   :   :   :   :   |
        | - ║ 0 : 0 : 0 : 0 :   :   :   :   :   |
        | - ║ 0 : 0 : 0 : 0 :   :   :   :   :   |
        | - ║ 0 : 0 : 1 : C : 1 : 1 : 0 :   :   |
        | - ║ 0 : 0 : 1 : 2 : 1 : 1 : 0 :   :   |
        | - ║   :   : 0 : 1 : 1 : 1 : 0 :   :   |
        | - ║   :   :   : 0 : 0 : 0 : 0 :   :   |
        |   ║   :   :   :   :   :   :   :   :   |
        `).toBeMatchToSelectionPattern();
      });
    });

    describe('by showing hidden,', () => {
      it('selected columns', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(5, 5),
          rowHeaders: true,
          colHeaders: true,
          hiddenColumns: {
            columns: [1, 2],
          },
        });

        selectColumns(1, 2);

        getPlugin('hiddenColumns').showColumns([2]);
        render();

        expect(getSelected()).toEqual([[-1, 1, 4, 2]]);
        expect(getSelectedRangeLast().highlight.row).toBe(0);
        expect(getSelectedRangeLast().highlight.col).toBe(2);
        expect(getSelectedRangeLast().from.row).toBe(-1);
        expect(getSelectedRangeLast().from.col).toBe(1);
        expect(getSelectedRangeLast().to.row).toBe(4);
        expect(getSelectedRangeLast().to.col).toBe(2);
        expect(`
        |   ║   : * :   :   |
        |===:===:===:===:===|
        | - ║   : A :   :   |
        | - ║   : 0 :   :   |
        | - ║   : 0 :   :   |
        | - ║   : 0 :   :   |
        | - ║   : 0 :   :   |
        `).toBeMatchToSelectionPattern();

        getPlugin('hiddenColumns').showColumns([1]);
        render();

        expect(getSelected()).toEqual([[-1, 1, 4, 2]]);
        expect(getSelectedRangeLast().highlight.row).toBe(0);
        expect(getSelectedRangeLast().highlight.col).toBe(1);
        expect(getSelectedRangeLast().from.row).toBe(-1);
        expect(getSelectedRangeLast().from.col).toBe(1);
        expect(getSelectedRangeLast().to.row).toBe(4);
        expect(getSelectedRangeLast().to.col).toBe(2);
        expect(`
        |   ║   : * : * :   :   |
        |===:===:===:===:===:===|
        | - ║   : A : 0 :   :   |
        | - ║   : 0 : 0 :   :   |
        | - ║   : 0 : 0 :   :   |
        | - ║   : 0 : 0 :   :   |
        | - ║   : 0 : 0 :   :   |
        `).toBeMatchToSelectionPattern();
      });

      it('selected cell', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(5, 5),
          rowHeaders: true,
          colHeaders: true,
          hiddenColumns: {
            columns: [1],
          },
        });

        selectCell(3, 1);

        getPlugin('hiddenColumns').showColumns([1]);
        render();

        expect(getSelected()).toEqual([[3, 1, 3, 1]]);
        expect(getSelectedRangeLast().highlight.row).toBe(3);
        expect(getSelectedRangeLast().highlight.col).toBe(1);
        expect(getSelectedRangeLast().from.row).toBe(3);
        expect(getSelectedRangeLast().from.col).toBe(1);
        expect(getSelectedRangeLast().to.row).toBe(3);
        expect(getSelectedRangeLast().to.col).toBe(1);
        expect(`
        |   ║   : - :   :   :   |
        |===:===:===:===:===:===|
        |   ║   :   :   :   :   |
        |   ║   :   :   :   :   |
        |   ║   :   :   :   :   |
        | - ║   : # :   :   :   |
        |   ║   :   :   :   :   |
        `).toBeMatchToSelectionPattern();
      });

      it('selected cells (just a few)', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(5, 5),
          rowHeaders: true,
          colHeaders: true,
          hiddenColumns: {
            columns: [1],
          },
        });

        selectCells([[3, 1], [0, 1], [0, 1]]);

        getPlugin('hiddenColumns').showColumns([1]);
        render();

        expect(getSelected()).toEqual([[3, 1, 3, 1], [0, 1, 0, 1], [0, 1, 0, 1]]);
        expect(getSelectedRangeLast().highlight.row).toBe(0);
        expect(getSelectedRangeLast().highlight.col).toBe(1);
        expect(getSelectedRangeLast().from.row).toBe(0);
        expect(getSelectedRangeLast().from.col).toBe(1);
        expect(getSelectedRangeLast().to.row).toBe(0);
        expect(getSelectedRangeLast().to.col).toBe(1);
        expect(`
        |   ║   : - :   :   :   |
        |===:===:===:===:===:===|
        | - ║   : B :   :   :   |
        |   ║   :   :   :   :   |
        |   ║   :   :   :   :   |
        | - ║   : 0 :   :   :   |
        |   ║   :   :   :   :   |
        `).toBeMatchToSelectionPattern();
      });

      it('selected cells (all of them)', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(5, 5),
          rowHeaders: true,
          colHeaders: true,
          hiddenColumns: {
            columns: [0, 1, 2, 3, 4],
          },
        });

        selectAll();

        getPlugin('hiddenColumns').showColumns([0, 1, 2, 3, 4]);
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

    it('by showing columns from a selection containing hidden columns at the start and at the end of the range', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [1, 3],
        },
      });

      selectColumns(1, 3);

      getPlugin('hiddenColumns').showColumns([3]);
      render();

      expect(getSelected()).toEqual([[-1, 1, 4, 3]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(2);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(1);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(3);
      expect(`
      |   ║   : * : * :   |
      |===:===:===:===:===|
      | - ║   : A : 0 :   |
      | - ║   : 0 : 0 :   |
      | - ║   : 0 : 0 :   |
      | - ║   : 0 : 0 :   |
      | - ║   : 0 : 0 :   |
      `).toBeMatchToSelectionPattern();

      getPlugin('hiddenColumns').showColumns([1]);
      render();

      expect(getSelected()).toEqual([[-1, 1, 4, 3]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(1);
      expect(getSelectedRangeLast().from.row).toBe(-1);
      expect(getSelectedRangeLast().from.col).toBe(1);
      expect(getSelectedRangeLast().to.row).toBe(4);
      expect(getSelectedRangeLast().to.col).toBe(3);
      expect(`
      |   ║   : * : * : * :   |
      |===:===:===:===:===:===|
      | - ║   : A : 0 : 0 :   |
      | - ║   : 0 : 0 : 0 :   |
      | - ║   : 0 : 0 : 0 :   |
      | - ║   : 0 : 0 : 0 :   |
      | - ║   : 0 : 0 : 0 :   |
      `).toBeMatchToSelectionPattern();
    });

    describe('by hiding', () => {
      it('selected columns', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(5, 5),
          rowHeaders: true,
          colHeaders: true,
          hiddenColumns: true,
        });

        selectColumns(1, 2);

        getPlugin('hiddenColumns').hideColumns([1]);
        render();

        expect(getSelected()).toEqual([[-1, 1, 4, 2]]);
        expect(getSelectedRangeLast().highlight.row).toBe(0);
        expect(getSelectedRangeLast().highlight.col).toBe(2);
        expect(getSelectedRangeLast().from.row).toBe(-1);
        expect(getSelectedRangeLast().from.col).toBe(1);
        expect(getSelectedRangeLast().to.row).toBe(4);
        expect(getSelectedRangeLast().to.col).toBe(2);
        expect(`
        |   ║   : * :   :   |
        |===:===:===:===:===|
        | - ║   : A :   :   |
        | - ║   : 0 :   :   |
        | - ║   : 0 :   :   |
        | - ║   : 0 :   :   |
        | - ║   : 0 :   :   |
        `).toBeMatchToSelectionPattern();

        getPlugin('hiddenColumns').hideColumns([2]);
        render();

        expect(getSelected()).toEqual([[-1, 1, 4, 2]]);
        expect(getSelectedRangeLast().highlight.row).toBe(0);
        expect(getSelectedRangeLast().highlight.col).toBe(1);
        expect(getSelectedRangeLast().from.row).toBe(-1);
        expect(getSelectedRangeLast().from.col).toBe(1);
        expect(getSelectedRangeLast().to.row).toBe(4);
        expect(getSelectedRangeLast().to.col).toBe(2);
        expect(`
        |   ║   :   :   |
        |===:===:===:===|
        | - ║   :   :   |
        | - ║   :   :   |
        | - ║   :   :   |
        | - ║   :   :   |
        | - ║   :   :   |
        `).toBeMatchToSelectionPattern();
      });

      it('selected cell', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(5, 5),
          rowHeaders: true,
          colHeaders: true,
          hiddenColumns: true,
        });

        selectCell(3, 1);

        getPlugin('hiddenColumns').hideColumns([1]);
        render();

        expect(getSelected()).toEqual([[3, 1, 3, 1]]);
        expect(getSelectedRangeLast().highlight.row).toBe(3);
        expect(getSelectedRangeLast().highlight.col).toBe(1);
        expect(getSelectedRangeLast().from.row).toBe(3);
        expect(getSelectedRangeLast().from.col).toBe(1);
        expect(getSelectedRangeLast().to.row).toBe(3);
        expect(getSelectedRangeLast().to.col).toBe(1);
        expect(`
        |   ║   :   :   :   |
        |===:===:===:===:===|
        |   ║   :   :   :   |
        |   ║   :   :   :   |
        |   ║   :   :   :   |
        | - ║   :   :   :   |
        |   ║   :   :   :   |
        `).toBeMatchToSelectionPattern();
      });

      it('selected cells', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(5, 5),
          rowHeaders: true,
          colHeaders: true,
          hiddenColumns: true,
        });

        selectCells([[3, 1], [0, 1], [0, 1]]);

        getPlugin('hiddenColumns').hideColumns([1]);
        render();

        expect(getSelected()).toEqual([[3, 1, 3, 1], [0, 1, 0, 1], [0, 1, 0, 1]]);
        expect(getSelectedRangeLast().highlight.row).toBe(0);
        expect(getSelectedRangeLast().highlight.col).toBe(1);
        expect(getSelectedRangeLast().from.row).toBe(0);
        expect(getSelectedRangeLast().from.col).toBe(1);
        expect(getSelectedRangeLast().to.row).toBe(0);
        expect(getSelectedRangeLast().to.col).toBe(1);
        expect(`
        |   ║   :   :   :   |
        |===:===:===:===:===|
        | - ║   :   :   :   |
        |   ║   :   :   :   |
        |   ║   :   :   :   |
        | - ║   :   :   :   |
        |   ║   :   :   :   |
        `).toBeMatchToSelectionPattern();
      });

      it('all selected cells', () => {
        handsontable({
          data: Handsontable.helper.createSpreadsheetData(5, 5),
          rowHeaders: true,
          colHeaders: true,
          hiddenColumns: true,
        });

        selectAll();

        getPlugin('hiddenColumns').hideColumns([0, 1, 2, 3, 4]);
        render();

        expect(getSelected()).toEqual([[-1, -1, 4, 4]]);
        expect(getSelectedRangeLast().highlight.row).toBe(0);
        expect(getSelectedRangeLast().highlight.col).toBe(0);
        expect(getSelectedRangeLast().from.row).toBe(-1);
        expect(getSelectedRangeLast().from.col).toBe(-1);
        expect(getSelectedRangeLast().to.row).toBe(4);
        expect(getSelectedRangeLast().to.col).toBe(4);
        expect(`
        |   |
        |===|
        | * |
        | * |
        | * |
        | * |
        | * |
        `).toBeMatchToSelectionPattern();
      });
    });

    it('showed columns on a table with all columns hidden and with selected entire row', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        hiddenColumns: {
          columns: [0, 1, 2, 3, 4],
        },
      });

      selectRows(0);

      getPlugin('hiddenColumns').showColumns([4]);
      render();

      expect(getSelected()).toEqual([[0, -1, 0, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(4);
      expect(getSelectedRangeLast().from.row).toBe(0);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(0);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
      |   ║ - |
      |===:===|
      | * ║ A |
      |   ║   |
      |   ║   |
      |   ║   |
      |   ║   |
      `).toBeMatchToSelectionPattern();

      getPlugin('hiddenColumns').showColumns([1, 2, 3]);
      render();

      expect(getSelected()).toEqual([[0, -1, 0, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(1);
      expect(getSelectedRangeLast().from.row).toBe(0);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(0);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
      |   ║ - : - : - : - |
      |===:===:===:===:===|
      | * ║ A : 0 : 0 : 0 |
      |   ║   :   :   :   |
      |   ║   :   :   :   |
      |   ║   :   :   :   |
      |   ║   :   :   :   |
      `).toBeMatchToSelectionPattern();

      getPlugin('hiddenColumns').showColumns([0]);
      render();

      expect(getSelected()).toEqual([[0, -1, 0, 4]]);
      expect(getSelectedRangeLast().highlight.row).toBe(0);
      expect(getSelectedRangeLast().highlight.col).toBe(0);
      expect(getSelectedRangeLast().from.row).toBe(0);
      expect(getSelectedRangeLast().from.col).toBe(-1);
      expect(getSelectedRangeLast().to.row).toBe(0);
      expect(getSelectedRangeLast().to.col).toBe(4);
      expect(`
      |   ║ - : - : - : - : - |
      |===:===:===:===:===:===|
      | * ║ A : 0 : 0 : 0 : 0 |
      |   ║   :   :   :   :   |
      |   ║   :   :   :   :   |
      |   ║   :   :   :   :   |
      |   ║   :   :   :   :   |
      `).toBeMatchToSelectionPattern();
    });
  });
});
