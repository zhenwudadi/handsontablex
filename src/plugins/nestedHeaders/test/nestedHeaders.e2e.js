describe('NestedHeaders', () => {
  const id = 'testContainer';

  function extractDOMStructure(overlayTHead, overlayTBody) {
    const cloneTHeadOverlay = overlayTHead.find('thead')[0].cloneNode(true);
    const cellsRow = overlayTBody ? overlayTBody.find('tbody tr')[0].cloneNode(true).outerHTML : '';

    Array.from(cloneTHeadOverlay.querySelectorAll('th')).forEach((TH) => {
      // Simplify header content
      TH.innerText = TH.querySelector('.colHeader').innerText;
      TH.removeAttribute('style');
    });

    return `${cloneTHeadOverlay.outerHTML}${cellsRow ? `<tbody>${cellsRow}</tbody>` : ''}`;
  }

  /**
   * @param hot
   * @param row
   */
  function nonHiddenTHs(hot, row) {
    const headerRows = hot.view.wt.wtTable.THEAD.querySelectorAll('tr');

    return headerRows[row].querySelectorAll('th:not(.hiddenHeader)');
  }

  function generateComplexSetup(rows, cols, generateNestedHeaders = false) {
    const data = [];

    for (let i = 0; i < rows; i++) {
      let labelCursor = 0;

      for (let j = 0; j < cols; j++) {
        if (!data[i]) {
          data[i] = [];
        }

        const columnLabel = Handsontable.helper.spreadsheetColumnLabel(labelCursor);

        if (!generateNestedHeaders) {
          data[i][j] = `${columnLabel}${i + 1}`;
          labelCursor += 1;
          /* eslint-disable no-continue */
          continue;
        }

        if (i === 0 && j % 2 !== 0) {
          data[i][j] = {
            label: `${columnLabel}${i + 1}`,
            colspan: 8
          };
        } else if (i === 1 && (j % 3 === 1 || j % 3 === 2)) {
          data[i][j] = {
            label: `${columnLabel}${i + 1}`,
            colspan: 4
          };
        } else if (i === 2 && (j % 5 === 1 || j % 5 === 2 || j % 5 === 3 || j % 5 === 4)) {
          data[i][j] = {
            label: `${columnLabel}${i + 1}`,
            colspan: 2
          };
        } else {
          data[i][j] = `${columnLabel}${i + 1}`;
        }

        labelCursor += data[i][j].colspan ?? 1;
      }
    }

    return data;
  }

  beforeEach(function() {
    this.$container = $(`<div id="${id}"></div>`).appendTo('body');
  });

  afterEach(function() {
    if (this.$container) {
      destroy();
      this.$container.remove();
    }
  });

  describe('initialization', () => {
    it('should be possible to initialize the plugin with minimal setup', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        colHeaders: true,
      });

      hot.updateSettings({
        nestedHeaders: [[]],
      });

      expect(extractDOMStructure(getTopClone(), getMaster())).toMatchHTML(`
        <thead>
          <tr>
            <th class=""></th>
            <th class=""></th>
            <th class=""></th>
            <th class=""></th>
            <th class=""></th>
            <th class=""></th>
            <th class=""></th>
            <th class=""></th>
            <th class=""></th>
            <th class=""></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="">A1</td>
            <td class="">B1</td>
            <td class="">C1</td>
            <td class="">D1</td>
            <td class="">E1</td>
            <td class="">F1</td>
            <td class="">G1</td>
            <td class="">H1</td>
            <td class="">I1</td>
            <td class="">J1</td>
          </tr>
        </tbody>
        `);
    });

    it('should be possible to disable the plugin using the disablePlugin method', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        colHeaders: true,
        nestedHeaders: [
          ['A1', { label: 'B1', colspan: 3 }, 'E1', 'F1', 'G1'],
          ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2']
        ],
      });

      const plugin = hot.getPlugin('nestedHeaders');

      plugin.disablePlugin();
      hot.render();

      expect(extractDOMStructure(getTopClone(), getMaster())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A</th>
            <th class="">B</th>
            <th class="">C</th>
            <th class="">D</th>
            <th class="">E</th>
            <th class="">F</th>
            <th class="">G</th>
            <th class="">H</th>
            <th class="">I</th>
            <th class="">J</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="">A1</td>
            <td class="">B1</td>
            <td class="">C1</td>
            <td class="">D1</td>
            <td class="">E1</td>
            <td class="">F1</td>
            <td class="">G1</td>
            <td class="">H1</td>
            <td class="">I1</td>
            <td class="">J1</td>
          </tr>
        </tbody>
        `);
    });

    it('should be possible to re-enable the plugin using the enablePlugin method', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        colHeaders: true,
        nestedHeaders: [
          ['A1', { label: 'B1', colspan: 3 }, 'E1', 'F1', 'G1'],
          ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2']
        ],
      });

      const plugin = hot.getPlugin('nestedHeaders');

      plugin.disablePlugin();
      hot.render();
      plugin.enablePlugin();
      hot.render();

      expect(extractDOMStructure(getTopClone(), getMaster())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A1</th>
            <th class="" colspan="3">B1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">E1</th>
            <th class="">F1</th>
            <th class="">G1</th>
            <th class=""></th>
            <th class=""></th>
            <th class=""></th>
          </tr>
          <tr>
            <th class="">A2</th>
            <th class="">B2</th>
            <th class="">C2</th>
            <th class="">D2</th>
            <th class="">E2</th>
            <th class="">F2</th>
            <th class="">G2</th>
            <th class=""></th>
            <th class=""></th>
            <th class=""></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="">A1</td>
            <td class="">B1</td>
            <td class="">C1</td>
            <td class="">D1</td>
            <td class="">E1</td>
            <td class="">F1</td>
            <td class="">G1</td>
            <td class="">H1</td>
            <td class="">I1</td>
            <td class="">J1</td>
          </tr>
        </tbody>
        `);
    });

    it('should be possible to initialize the plugin using the updateSettings method', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        colHeaders: true,
      });

      hot.updateSettings({
        nestedHeaders: [
          ['A1', { label: 'B1', colspan: 3 }, 'E1', 'F1', 'G1'],
          ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2']
        ],
      });

      expect(extractDOMStructure(getTopClone(), getMaster())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A1</th>
            <th class="" colspan="3">B1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">E1</th>
            <th class="">F1</th>
            <th class="">G1</th>
            <th class=""></th>
            <th class=""></th>
            <th class=""></th>
          </tr>
          <tr>
            <th class="">A2</th>
            <th class="">B2</th>
            <th class="">C2</th>
            <th class="">D2</th>
            <th class="">E2</th>
            <th class="">F2</th>
            <th class="">G2</th>
            <th class=""></th>
            <th class=""></th>
            <th class=""></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="">A1</td>
            <td class="">B1</td>
            <td class="">C1</td>
            <td class="">D1</td>
            <td class="">E1</td>
            <td class="">F1</td>
            <td class="">G1</td>
            <td class="">H1</td>
            <td class="">I1</td>
            <td class="">J1</td>
          </tr>
        </tbody>
        `);
    });

    it('should be possible to disable the plugin using updateSettings method', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        colHeaders: true,
        nestedHeaders: [
          ['A1', { label: 'B1', colspan: 3 }, 'E1', 'F1', 'G1'],
          ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2']
        ],
      });

      hot.updateSettings({
        nestedHeaders: false,
      });

      expect(extractDOMStructure(getTopClone(), getMaster())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A</th>
            <th class="">B</th>
            <th class="">C</th>
            <th class="">D</th>
            <th class="">E</th>
            <th class="">F</th>
            <th class="">G</th>
            <th class="">H</th>
            <th class="">I</th>
            <th class="">J</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="">A1</td>
            <td class="">B1</td>
            <td class="">C1</td>
            <td class="">D1</td>
            <td class="">E1</td>
            <td class="">F1</td>
            <td class="">G1</td>
            <td class="">H1</td>
            <td class="">I1</td>
            <td class="">J1</td>
          </tr>
        </tbody>
        `);
    });

    it('should be possible to update the plugin settings using the updateSettings method', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        colHeaders: true,
        nestedHeaders: [
          ['A1', { label: 'B1', colspan: 3 }, 'E1', 'F1', 'G1'],
          ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2']
        ],
      });

      hot.updateSettings({
        nestedHeaders: [
          ['A1', { label: 'B1', colspan: 4 }, 'F1', 'G1', 'H1', 'I1', 'J1'],
          ['A2', { label: 'B2', colspan: 3 }, 'E2', 'F2', 'G2', 'H2', 'I2', 'J2'],
          ['A3', 'B3', { label: 'C3', colspan: 2 }, 'E3', 'F3', 'G3', 'H3', 'I3', 'J3'],
        ],
      });

      expect(extractDOMStructure(getTopClone(), getMaster())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A1</th>
            <th class="" colspan="4">B1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">F1</th>
            <th class="">G1</th>
            <th class="">H1</th>
            <th class="">I1</th>
            <th class="">J1</th>
          </tr>
          <tr>
            <th class="">A2</th>
            <th class="" colspan="3">B2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">E2</th>
            <th class="">F2</th>
            <th class="">G2</th>
            <th class="">H2</th>
            <th class="">I2</th>
            <th class="">J2</th>
          </tr>
          <tr>
            <th class="">A3</th>
            <th class="">B3</th>
            <th class="" colspan="2">C3</th>
            <th class="hiddenHeader"></th>
            <th class="">E3</th>
            <th class="">F3</th>
            <th class="">G3</th>
            <th class="">H3</th>
            <th class="">I3</th>
            <th class="">J3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="">A1</td>
            <td class="">B1</td>
            <td class="">C1</td>
            <td class="">D1</td>
            <td class="">E1</td>
            <td class="">F1</td>
            <td class="">G1</td>
            <td class="">H1</td>
            <td class="">I1</td>
            <td class="">J1</td>
          </tr>
        </tbody>
        `);
    });

    it('should warn the developer when the settings contains overlaping headers', () => {
      const warnSpy = spyOn(console, 'warn');

      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        colHeaders: true,
        nestedHeaders: [
          ['a', { label: 'b', colspan: 2 }, 'c'],
          ['a', { label: 'b', colspan: 3 }, 'c']
        ],
      });

      expect(warnSpy).toHaveBeenCalledWith('Your Nested Headers plugin setup contains overlapping headers. ' +
                                           'This kind of configuration is currently not supported.');
      expect(extractDOMStructure(getTopClone(), getMaster())).toMatchHTML(`
        <thead></thead>
        <tbody>
          <tr>
            <td class="">A1</td>
            <td class="">B1</td>
            <td class="">C1</td>
            <td class="">D1</td>
            <td class="">E1</td>
          </tr>
        </tbody>
        `);
      expect(extractDOMStructure(getMaster(), getMaster())).toMatchHTML(`
        <thead></thead>
        <tbody>
          <tr>
            <td class="">A1</td>
            <td class="">B1</td>
            <td class="">C1</td>
            <td class="">D1</td>
            <td class="">E1</td>
          </tr>
        </tbody>
        `);
    });

    it('should warn the developer when the settings are invalid', () => {
      const warnSpy = spyOn(console, 'warn');
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        colHeaders: true,
      });

      hot.updateSettings({
        nestedHeaders: true,
      });

      /* eslint-disable quotes */
      const expectedWarn = `Your Nested Headers plugin configuration is invalid. The ` +
                           `settings has to be passed as an array of arrays e.q. ` +
                           `[['A1', { label: 'A2', colspan: 2 }]]`;
      /* eslint-enable quotes */

      expect(warnSpy).toHaveBeenCalledWith(expectedWarn);
      expect(extractDOMStructure(getTopClone(), getMaster())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A</th>
            <th class="">B</th>
            <th class="">C</th>
            <th class="">D</th>
            <th class="">E</th>
            <th class="">F</th>
            <th class="">G</th>
            <th class="">H</th>
            <th class="">I</th>
            <th class="">J</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="">A1</td>
            <td class="">B1</td>
            <td class="">C1</td>
            <td class="">D1</td>
            <td class="">E1</td>
            <td class="">F1</td>
            <td class="">G1</td>
            <td class="">H1</td>
            <td class="">I1</td>
            <td class="">J1</td>
          </tr>
        </tbody>
        `);

      hot.updateSettings({
        nestedHeaders: [],
      });

      expect(warnSpy).toHaveBeenCalledWith(expectedWarn);
      expect(extractDOMStructure(getTopClone(), getMaster())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A</th>
            <th class="">B</th>
            <th class="">C</th>
            <th class="">D</th>
            <th class="">E</th>
            <th class="">F</th>
            <th class="">G</th>
            <th class="">H</th>
            <th class="">I</th>
            <th class="">J</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="">A1</td>
            <td class="">B1</td>
            <td class="">C1</td>
            <td class="">D1</td>
            <td class="">E1</td>
            <td class="">F1</td>
            <td class="">G1</td>
            <td class="">H1</td>
            <td class="">I1</td>
            <td class="">J1</td>
          </tr>
        </tbody>
        `);

      hot.updateSettings({
        nestedHeaders: {},
      });

      expect(warnSpy).toHaveBeenCalledWith(expectedWarn);
      expect(extractDOMStructure(getTopClone(), getMaster())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A</th>
            <th class="">B</th>
            <th class="">C</th>
            <th class="">D</th>
            <th class="">E</th>
            <th class="">F</th>
            <th class="">G</th>
            <th class="">H</th>
            <th class="">I</th>
            <th class="">J</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="">A1</td>
            <td class="">B1</td>
            <td class="">C1</td>
            <td class="">D1</td>
            <td class="">E1</td>
            <td class="">F1</td>
            <td class="">G1</td>
            <td class="">H1</td>
            <td class="">I1</td>
            <td class="">J1</td>
          </tr>
        </tbody>
        `);

      hot.updateSettings({
        nestedHeaders: '',
      });

      expect(warnSpy).toHaveBeenCalledWith(expectedWarn);
      expect(extractDOMStructure(getTopClone(), getMaster())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A</th>
            <th class="">B</th>
            <th class="">C</th>
            <th class="">D</th>
            <th class="">E</th>
            <th class="">F</th>
            <th class="">G</th>
            <th class="">H</th>
            <th class="">I</th>
            <th class="">J</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="">A1</td>
            <td class="">B1</td>
            <td class="">C1</td>
            <td class="">D1</td>
            <td class="">E1</td>
            <td class="">F1</td>
            <td class="">G1</td>
            <td class="">H1</td>
            <td class="">I1</td>
            <td class="">J1</td>
          </tr>
        </tbody>
        `);
    });
  });

  describe('basic functionality', () => {
    it('should add as many header levels as the \'colHeaders\' property suggests', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        colHeaders: true,
        nestedHeaders: [
          ['a', 'b', 'c', 'd'],
          ['a', 'b', 'c', 'd']
        ]
      });

      expect(hot.view.wt.wtTable.THEAD.querySelectorAll('tr').length).toEqual(2);
    });

    it('should adjust headers widths', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        colHeaders: true,
        nestedHeaders: [
          ['a', { label: 'b', colspan: 2 }, 'c', 'd'],
          ['a', 'Long column header', 'c', 'd']
        ]
      });

      const headers = hot.view.wt.wtTable.THEAD.querySelectorAll('tr:first-of-type th');

      expect(hot.getColWidth(1)).toBeGreaterThan(50);
      expect(headers[1].offsetWidth).toBeGreaterThan(100);
    });

    it('should correctly render headers when loaded dataset is shorter (less columns) than nested headers settings', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        colHeaders: true,
        nestedHeaders: generateComplexSetup(4, 100, true),
        width: 400,
        height: 300,
      });

      expect(extractDOMStructure(getTopClone(), getMaster())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A1</th>
            <th class="" colspan="8">B1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">J1</th>
          </tr>
          <tr>
            <th class="">A2</th>
            <th class="" colspan="4">B2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="4">F2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">J2</th>
          </tr>
          <tr>
            <th class="">A3</th>
            <th class="" colspan="2">B3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">D3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">F3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">H3</th>
            <th class="hiddenHeader"></th>
            <th class="">J3</th>
          </tr>
          <tr>
            <th class="">A4</th>
            <th class="">B4</th>
            <th class="">C4</th>
            <th class="">D4</th>
            <th class="">E4</th>
            <th class="">F4</th>
            <th class="">G4</th>
            <th class="">H4</th>
            <th class="">I4</th>
            <th class="">J4</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="">A1</td>
            <td class="">B1</td>
            <td class="">C1</td>
            <td class="">D1</td>
            <td class="">E1</td>
            <td class="">F1</td>
            <td class="">G1</td>
            <td class="">H1</td>
            <td class="">I1</td>
            <td class="">J1</td>
          </tr>
        </tbody>
        `);

      hot.loadData(Handsontable.helper.createSpreadsheetData(5, 5));

      expect(extractDOMStructure(getTopClone(), getMaster())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A1</th>
            <th class="" colspan="4">B1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
          </tr>
          <tr>
            <th class="">A2</th>
            <th class="" colspan="4">B2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
          </tr>
          <tr>
            <th class="">A3</th>
            <th class="" colspan="2">B3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">D3</th>
            <th class="hiddenHeader"></th>
          </tr>
          <tr>
            <th class="">A4</th>
            <th class="">B4</th>
            <th class="">C4</th>
            <th class="">D4</th>
            <th class="">E4</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="">A1</td>
            <td class="">B1</td>
            <td class="">C1</td>
            <td class="">D1</td>
            <td class="">E1</td>
          </tr>
        </tbody>
        `);

      hot.loadData(Handsontable.helper.createSpreadsheetData(5, 2));

      expect(extractDOMStructure(getTopClone(), getMaster())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A1</th>
            <th class="">B1</th>
          </tr>
          <tr>
            <th class="">A2</th>
            <th class="">B2</th>
          </tr>
          <tr>
            <th class="">A3</th>
            <th class="">B3</th>
          </tr>
          <tr>
            <th class="">A4</th>
            <th class="">B4</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="">A1</td>
            <td class="">B1</td>
          </tr>
        </tbody>
        `);

      hot.loadData(Handsontable.helper.createSpreadsheetData(5, 6));

      expect(extractDOMStructure(getTopClone(), getMaster())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A1</th>
            <th class="" colspan="5">B1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
          </tr>
          <tr>
            <th class="">A2</th>
            <th class="" colspan="4">B2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">F2</th>
          </tr>
          <tr>
            <th class="">A3</th>
            <th class="" colspan="2">B3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">D3</th>
            <th class="hiddenHeader"></th>
            <th class="">F3</th>
          </tr>
          <tr>
            <th class="">A4</th>
            <th class="">B4</th>
            <th class="">C4</th>
            <th class="">D4</th>
            <th class="">E4</th>
            <th class="">F4</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="">A1</td>
            <td class="">B1</td>
            <td class="">C1</td>
            <td class="">D1</td>
            <td class="">E1</td>
            <td class="">F1</td>
          </tr>
        </tbody>
        `);
    });
  });

  describe('The \'colspan\' property', () => {
    it('should allow creating a more complex nested setup when fixedColumnsLeft option is enabled', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        colHeaders: true,
        fixedColumnsLeft: 2,
        nestedHeaders: [
          ['A1', { label: 'B1', colspan: 4 }, 'F1', 'G1'],
          ['A2', { label: 'B2', colspan: 2 }, { label: 'D2', colspan: 2 }, 'F2', 'G2']
        ],
      });

      {
        const htmlPattern = `
          <thead>
            <tr>
              <th class="">A1</th>
              <th class="">B1</th>
            </tr>
            <tr>
              <th class="">A2</th>
              <th class="">B2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="">A1</td>
              <td class="">B1</td>
            </tr>
          </tbody>
          `;
        expect(extractDOMStructure(getTopLeftClone(), getLeftClone())).toMatchHTML(htmlPattern);
        expect(extractDOMStructure(getLeftClone(), getLeftClone())).toMatchHTML(htmlPattern);
      }

      updateSettings({ fixedColumnsLeft: 3 });

      {
        const htmlPattern = `
          <thead>
            <tr>
              <th class="">A1</th>
              <th class="" colspan="2">B1</th>
              <th class="hiddenHeader"></th>
            </tr>
            <tr>
              <th class="">A2</th>
              <th class="" colspan="2">B2</th>
              <th class="hiddenHeader"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="">A1</td>
              <td class="">B1</td>
              <td class="">C1</td>
            </tr>
          </tbody>
          `;
        expect(extractDOMStructure(getTopLeftClone(), getLeftClone())).toMatchHTML(htmlPattern);
        expect(extractDOMStructure(getLeftClone(), getLeftClone())).toMatchHTML(htmlPattern);
      }

      updateSettings({ fixedColumnsLeft: 6 });

      {
        const htmlPattern = `
          <thead>
            <tr>
              <th class="">A1</th>
              <th class="" colspan="4">B1</th>
              <th class="hiddenHeader"></th>
              <th class="hiddenHeader"></th>
              <th class="hiddenHeader"></th>
              <th class="">F1</th>
            </tr>
            <tr>
              <th class="">A2</th>
              <th class="" colspan="2">B2</th>
              <th class="hiddenHeader"></th>
              <th class="" colspan="2">D2</th>
              <th class="hiddenHeader"></th>
              <th class="">F2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="">A1</td>
              <td class="">B1</td>
              <td class="">C1</td>
              <td class="">D1</td>
              <td class="">E1</td>
              <td class="">F1</td>
            </tr>
          </tbody>
          `;
        expect(extractDOMStructure(getTopLeftClone(), getLeftClone())).toMatchHTML(htmlPattern);
        expect(extractDOMStructure(getLeftClone(), getLeftClone())).toMatchHTML(htmlPattern);
      }
    });

    it('should return a relevant nested header element in hot.getCell()', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 90),
        colHeaders: true,
        nestedHeaders: generateComplexSetup(4, 70, true),
        width: 400,
        height: 300,
        viewportColumnRenderingOffset: 15
      });

      const allTHs = function allTHs(row) {
        const headerRows = hot.view.wt.wtTable.THEAD.querySelectorAll('tr');
        return headerRows[row].querySelectorAll('th');
      };
      const levels = [nonHiddenTHs(hot, 0), nonHiddenTHs(hot, 1), nonHiddenTHs(hot, 2), nonHiddenTHs(hot, 3)];

      expect(levels[0][0]).toEqual(getCell(-4, 0));
      expect(levels[0][1]).toEqual(getCell(-4, 1));
      expect(allTHs(0)[2]).toEqual(getCell(-4, 2));
      expect(allTHs(0)[3]).toEqual(getCell(-4, 3));
      expect(levels[0][2]).toEqual(getCell(-4, 9));
      expect(levels[0][3]).toEqual(getCell(-4, 10));
      expect(levels[0][4]).toEqual(getCell(-4, 18));
      expect(levels[0][5]).toEqual(getCell(-4, 19));

      expect(levels[1][0]).toEqual(getCell(-3, 0));
      expect(levels[1][1]).toEqual(getCell(-3, 1));
      expect(levels[1][2]).toEqual(getCell(-3, 5));
      expect(levels[1][3]).toEqual(getCell(-3, 9));

      expect(levels[2][0]).toEqual(getCell(-2, 0));
      expect(levels[2][1]).toEqual(getCell(-2, 1));
      expect(levels[2][2]).toEqual(getCell(-2, 3));
      expect(levels[2][3]).toEqual(getCell(-2, 5));

      expect(levels[3][0]).toEqual(getCell(-1, 0));
      expect(levels[3][1]).toEqual(getCell(-1, 1));
      expect(levels[3][2]).toEqual(getCell(-1, 2));
      expect(levels[3][3]).toEqual(getCell(-1, 3));
    });

    it('should render the setup properly after the table being scrolled', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 90),
        colHeaders: true,
        nestedHeaders: generateComplexSetup(4, 70, true),
        width: 400,
        height: 300,
        viewportColumnRenderingOffset: 15
      });

      // not scrolled
      expect(extractDOMStructure(getTopClone(), getMaster())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A1</th>
            <th class="" colspan="8">B1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">J1</th>
            <th class="" colspan="8">K1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">S1</th>
            <th class="" colspan="8">T1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
          </tr>
          <tr>
            <th class="">A2</th>
            <th class="" colspan="4">B2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="4">F2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">J2</th>
            <th class="" colspan="4">K2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="4">O2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">S2</th>
            <th class="" colspan="4">T2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
          </tr>
          <tr>
            <th class="">A3</th>
            <th class="" colspan="2">B3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">D3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">F3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">H3</th>
            <th class="hiddenHeader"></th>
            <th class="">J3</th>
            <th class="" colspan="2">K3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">M3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">O3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">Q3</th>
            <th class="hiddenHeader"></th>
            <th class="">S3</th>
            <th class="" colspan="2">T3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">V3</th>
            <th class="hiddenHeader"></th>
          </tr>
          <tr>
            <th class="">A4</th>
            <th class="">B4</th>
            <th class="">C4</th>
            <th class="">D4</th>
            <th class="">E4</th>
            <th class="">F4</th>
            <th class="">G4</th>
            <th class="">H4</th>
            <th class="">I4</th>
            <th class="">J4</th>
            <th class="">K4</th>
            <th class="">L4</th>
            <th class="">M4</th>
            <th class="">N4</th>
            <th class="">O4</th>
            <th class="">P4</th>
            <th class="">Q4</th>
            <th class="">R4</th>
            <th class="">S4</th>
            <th class="">T4</th>
            <th class="">U4</th>
            <th class="">V4</th>
            <th class="">W4</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="">A1</td>
            <td class="">B1</td>
            <td class="">C1</td>
            <td class="">D1</td>
            <td class="">E1</td>
            <td class="">F1</td>
            <td class="">G1</td>
            <td class="">H1</td>
            <td class="">I1</td>
            <td class="">J1</td>
            <td class="">K1</td>
            <td class="">L1</td>
            <td class="">M1</td>
            <td class="">N1</td>
            <td class="">O1</td>
            <td class="">P1</td>
            <td class="">Q1</td>
            <td class="">R1</td>
            <td class="">S1</td>
            <td class="">T1</td>
            <td class="">U1</td>
            <td class="">V1</td>
            <td class="">W1</td>
          </tr>
        </tbody>
        `);

      hot.scrollViewportTo(void 0, 40);
      hot.render();

      // scrolled
      expect(extractDOMStructure(getTopClone(), getMaster())).toMatchHTML(`
        <thead>
          <tr>
            <th class="" colspan="8">T1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">AB1</th>
            <th class="" colspan="8">AC1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">AK1</th>
            <th class="" colspan="8">AL1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">AT1</th>
            <th class="" colspan="8">AU1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">BC1</th>
            <th class="" colspan="8">BD1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">BL1</th>
            <th class="" colspan="8">BM1</th>
          </tr>
          <tr>
            <th class="" colspan="4">T2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="4">X2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">AB2</th>
            <th class="" colspan="4">AC2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="4">AG2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">AK2</th>
            <th class="" colspan="4">AL2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="4">AP2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">AT2</th>
            <th class="" colspan="4">AU2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="4">AY2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">BC2</th>
            <th class="" colspan="4">BD2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="4">BH2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">BL2</th>
            <th class="" colspan="4">BM2</th>
          </tr>
          <tr>
            <th class="" colspan="2">T3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">V3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">X3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">Z3</th>
            <th class="hiddenHeader"></th>
            <th class="">AB3</th>
            <th class="" colspan="2">AC3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">AE3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">AG3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">AI3</th>
            <th class="hiddenHeader"></th>
            <th class="">AK3</th>
            <th class="" colspan="2">AL3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">AN3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">AP3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">AR3</th>
            <th class="hiddenHeader"></th>
            <th class="">AT3</th>
            <th class="" colspan="2">AU3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">AW3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">AY3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">BA3</th>
            <th class="hiddenHeader"></th>
            <th class="">BC3</th>
            <th class="" colspan="2">BD3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">BF3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">BH3</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">BJ3</th>
            <th class="hiddenHeader"></th>
            <th class="">BL3</th>
            <th class="" colspan="2">BM3</th>
          </tr>
          <tr>
            <th class="">T4</th>
            <th class="">U4</th>
            <th class="">V4</th>
            <th class="">W4</th>
            <th class="">X4</th>
            <th class="">Y4</th>
            <th class="">Z4</th>
            <th class="">AA4</th>
            <th class="">AB4</th>
            <th class="">AC4</th>
            <th class="">AD4</th>
            <th class="">AE4</th>
            <th class="">AF4</th>
            <th class="">AG4</th>
            <th class="">AH4</th>
            <th class="">AI4</th>
            <th class="">AJ4</th>
            <th class="">AK4</th>
            <th class="">AL4</th>
            <th class="">AM4</th>
            <th class="">AN4</th>
            <th class="">AO4</th>
            <th class="">AP4</th>
            <th class="">AQ4</th>
            <th class="">AR4</th>
            <th class="">AS4</th>
            <th class="">AT4</th>
            <th class="">AU4</th>
            <th class="">AV4</th>
            <th class="">AW4</th>
            <th class="">AX4</th>
            <th class="">AY4</th>
            <th class="">AZ4</th>
            <th class="">BA4</th>
            <th class="">BB4</th>
            <th class="">BC4</th>
            <th class="">BD4</th>
            <th class="">BE4</th>
            <th class="">BF4</th>
            <th class="">BG4</th>
            <th class="">BH4</th>
            <th class="">BI4</th>
            <th class="">BJ4</th>
            <th class="">BK4</th>
            <th class="">BL4</th>
            <th class="">BM4</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="">T1</td>
            <td class="">U1</td>
            <td class="">V1</td>
            <td class="">W1</td>
            <td class="">X1</td>
            <td class="">Y1</td>
            <td class="">Z1</td>
            <td class="">AA1</td>
            <td class="">AB1</td>
            <td class="">AC1</td>
            <td class="">AD1</td>
            <td class="">AE1</td>
            <td class="">AF1</td>
            <td class="">AG1</td>
            <td class="">AH1</td>
            <td class="">AI1</td>
            <td class="">AJ1</td>
            <td class="">AK1</td>
            <td class="">AL1</td>
            <td class="">AM1</td>
            <td class="">AN1</td>
            <td class="">AO1</td>
            <td class="">AP1</td>
            <td class="">AQ1</td>
            <td class="">AR1</td>
            <td class="">AS1</td>
            <td class="">AT1</td>
            <td class="">AU1</td>
            <td class="">AV1</td>
            <td class="">AW1</td>
            <td class="">AX1</td>
            <td class="">AY1</td>
            <td class="">AZ1</td>
            <td class="">BA1</td>
            <td class="">BB1</td>
            <td class="">BC1</td>
            <td class="">BD1</td>
            <td class="">BE1</td>
            <td class="">BF1</td>
            <td class="">BG1</td>
            <td class="">BH1</td>
            <td class="">BI1</td>
            <td class="">BJ1</td>
            <td class="">BK1</td>
            <td class="">BL1</td>
            <td class="">BM1</td>
          </tr>
        </tbody>
        `);
    });
  });

  describe('selection', () => {
    it('should generate class names based on "currentHeaderClassName" and "activeHeaderClassName" settings', function() {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        colHeaders: true,
        currentHeaderClassName: 'my-current-header',
        activeHeaderClassName: 'my-active-header',
        nestedHeaders: [
          ['A', { label: 'B', colspan: 8 }, 'C'],
          ['D', { label: 'E', colspan: 4 }, { label: 'F', colspan: 4 }, 'G'],
          ['H', { label: 'I', colspan: 2 }, { label: 'J', colspan: 2 }, { label: 'K', colspan: 2 }, { label: 'L', colspan: 2 }, 'M'],
          ['N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W']
        ]
      });

      this.$container.find('.ht_clone_top thead tr:eq(2) th:eq(1)')
        .simulate('mousedown')
        .simulate('mouseup');

      expect(extractDOMStructure(getTopClone())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A</th>
            <th class="" colspan="8">B</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">C</th>
          </tr>
          <tr>
            <th class="">D</th>
            <th class="" colspan="4">E</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="4">F</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">G</th>
          </tr>
          <tr>
            <th class="">H</th>
            <th class="my-active-header my-current-header" colspan="2">I</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">J</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">K</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">L</th>
            <th class="hiddenHeader"></th>
            <th class="">M</th>
          </tr>
          <tr>
            <th class="">N</th>
            <th class="my-active-header my-current-header">O</th>
            <th class="my-active-header my-current-header">P</th>
            <th class="">Q</th>
            <th class="">R</th>
            <th class="">S</th>
            <th class="">T</th>
            <th class="">U</th>
            <th class="">V</th>
            <th class="">W</th>
          </tr>
        </thead>
        `);
    });

    it('should highlight column header for selected cells', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        colHeaders: true,
        nestedHeaders: [
          ['A1', { label: 'B1', colspan: 4 }, 'F1', 'G1', 'H1', 'I1', 'J1'],
          ['A2', { label: 'B2', colspan: 3 }, 'E2', 'F2', 'G2', 'H2', 'I2', 'J2'],
          ['A3', 'B3', { label: 'C3', colspan: 2 }, 'E3', 'F3', 'G3', 'H3', 'I3', 'J3'],
        ],
      });

      selectCells([[0, 1, 0, 1]]); // B1

      expect(extractDOMStructure(getTopClone())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A1</th>
            <th class="" colspan="4">B1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">F1</th>
            <th class="">G1</th>
            <th class="">H1</th>
            <th class="">I1</th>
            <th class="">J1</th>
          </tr>
          <tr>
            <th class="">A2</th>
            <th class="" colspan="3">B2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">E2</th>
            <th class="">F2</th>
            <th class="">G2</th>
            <th class="">H2</th>
            <th class="">I2</th>
            <th class="">J2</th>
          </tr>
          <tr>
            <th class="">A3</th>
            <th class="ht__highlight">B3</th>
            <th class="" colspan="2">C3</th>
            <th class="hiddenHeader"></th>
            <th class="">E3</th>
            <th class="">F3</th>
            <th class="">G3</th>
            <th class="">H3</th>
            <th class="">I3</th>
            <th class="">J3</th>
          </tr>
        </thead>
        `);

      selectCells([[1, 2, 1, 2]]); // C2

      expect(extractDOMStructure(getTopClone())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A1</th>
            <th class="" colspan="4">B1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">F1</th>
            <th class="">G1</th>
            <th class="">H1</th>
            <th class="">I1</th>
            <th class="">J1</th>
          </tr>
          <tr>
            <th class="">A2</th>
            <th class="" colspan="3">B2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">E2</th>
            <th class="">F2</th>
            <th class="">G2</th>
            <th class="">H2</th>
            <th class="">I2</th>
            <th class="">J2</th>
          </tr>
          <tr>
            <th class="">A3</th>
            <th class="">B3</th>
            <th class="ht__highlight" colspan="2">C3</th>
            <th class="hiddenHeader"></th>
            <th class="">E3</th>
            <th class="">F3</th>
            <th class="">G3</th>
            <th class="">H3</th>
            <th class="">I3</th>
            <th class="">J3</th>
          </tr>
        </thead>
        `);

      selectCells([[1, 3, 1, 3]]); // D2

      expect(extractDOMStructure(getTopClone())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A1</th>
            <th class="" colspan="4">B1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">F1</th>
            <th class="">G1</th>
            <th class="">H1</th>
            <th class="">I1</th>
            <th class="">J1</th>
          </tr>
          <tr>
            <th class="">A2</th>
            <th class="" colspan="3">B2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">E2</th>
            <th class="">F2</th>
            <th class="">G2</th>
            <th class="">H2</th>
            <th class="">I2</th>
            <th class="">J2</th>
          </tr>
          <tr>
            <th class="">A3</th>
            <th class="">B3</th>
            <th class="ht__highlight" colspan="2">C3</th>
            <th class="hiddenHeader"></th>
            <th class="">E3</th>
            <th class="">F3</th>
            <th class="">G3</th>
            <th class="">H3</th>
            <th class="">I3</th>
            <th class="">J3</th>
          </tr>
        </thead>
        `);

      selectCells([[1, 4, 1, 6]]); // E2 to G2

      expect(extractDOMStructure(getTopClone())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A1</th>
            <th class="" colspan="4">B1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">F1</th>
            <th class="">G1</th>
            <th class="">H1</th>
            <th class="">I1</th>
            <th class="">J1</th>
          </tr>
          <tr>
            <th class="">A2</th>
            <th class="" colspan="3">B2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">E2</th>
            <th class="">F2</th>
            <th class="">G2</th>
            <th class="">H2</th>
            <th class="">I2</th>
            <th class="">J2</th>
          </tr>
          <tr>
            <th class="">A3</th>
            <th class="">B3</th>
            <th class="" colspan="2">C3</th>
            <th class="hiddenHeader"></th>
            <th class="ht__highlight">E3</th>
            <th class="ht__highlight">F3</th>
            <th class="ht__highlight">G3</th>
            <th class="">H3</th>
            <th class="">I3</th>
            <th class="">J3</th>
          </tr>
        </thead>
        `);
    });

    it('should highlight column header for selected cells in-between nested headers', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        colHeaders: true,
        nestedHeaders: [
          ['A1', { label: 'B1', colspan: 4 }, 'F1', 'G1', 'H1', 'I1', 'J1'],
          ['A2', { label: 'B2', colspan: 3 }, 'E2', 'F2', 'G2', 'H2', 'I2', 'J2'],
          ['A3', 'B3', { label: 'C3', colspan: 2 }, 'E3', 'F3', 'G3', 'H3', 'I3', 'J3'],
        ],
      });

      selectCells([[1, 2, 1, 5]]); // C2 to F2

      expect(extractDOMStructure(getTopClone())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A1</th>
            <th class="" colspan="4">B1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">F1</th>
            <th class="">G1</th>
            <th class="">H1</th>
            <th class="">I1</th>
            <th class="">J1</th>
          </tr>
          <tr>
            <th class="">A2</th>
            <th class="" colspan="3">B2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">E2</th>
            <th class="">F2</th>
            <th class="">G2</th>
            <th class="">H2</th>
            <th class="">I2</th>
            <th class="">J2</th>
          </tr>
          <tr>
            <th class="">A3</th>
            <th class="">B3</th>
            <th class="ht__highlight" colspan="2">C3</th>
            <th class="hiddenHeader"></th>
            <th class="ht__highlight">E3</th>
            <th class="ht__highlight">F3</th>
            <th class="">G3</th>
            <th class="">H3</th>
            <th class="">I3</th>
            <th class="">J3</th>
          </tr>
        </thead>
        `);

      selectCells([[1, 3, 1, 6]]); // D2 to G2

      expect(extractDOMStructure(getTopClone())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A1</th>
            <th class="" colspan="4">B1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">F1</th>
            <th class="">G1</th>
            <th class="">H1</th>
            <th class="">I1</th>
            <th class="">J1</th>
          </tr>
          <tr>
            <th class="">A2</th>
            <th class="" colspan="3">B2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">E2</th>
            <th class="">F2</th>
            <th class="">G2</th>
            <th class="">H2</th>
            <th class="">I2</th>
            <th class="">J2</th>
          </tr>
          <tr>
            <th class="">A3</th>
            <th class="">B3</th>
            <th class="ht__highlight" colspan="2">C3</th>
            <th class="hiddenHeader"></th>
            <th class="ht__highlight">E3</th>
            <th class="ht__highlight">F3</th>
            <th class="ht__highlight">G3</th>
            <th class="">H3</th>
            <th class="">I3</th>
            <th class="">J3</th>
          </tr>
        </thead>
        `);

      selectCells([[1, 0, 1, 2]]); // A2 to C2

      expect(extractDOMStructure(getTopClone())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A1</th>
            <th class="" colspan="4">B1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">F1</th>
            <th class="">G1</th>
            <th class="">H1</th>
            <th class="">I1</th>
            <th class="">J1</th>
          </tr>
          <tr>
            <th class="">A2</th>
            <th class="" colspan="3">B2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">E2</th>
            <th class="">F2</th>
            <th class="">G2</th>
            <th class="">H2</th>
            <th class="">I2</th>
            <th class="">J2</th>
          </tr>
          <tr>
            <th class="ht__highlight">A3</th>
            <th class="ht__highlight">B3</th>
            <th class="ht__highlight" colspan="2">C3</th>
            <th class="hiddenHeader"></th>
            <th class="">E3</th>
            <th class="">F3</th>
            <th class="">G3</th>
            <th class="">H3</th>
            <th class="">I3</th>
            <th class="">J3</th>
          </tr>
        </thead>
        `);
    });

    it('should highlight column header for non-contiguous selected cells', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        colHeaders: true,
        nestedHeaders: [
          ['A1', { label: 'B1', colspan: 4 }, 'F1', 'G1', 'H1', 'I1', 'J1'],
          ['A2', { label: 'B2', colspan: 3 }, 'E2', 'F2', 'G2', 'H2', 'I2', 'J2'],
          ['A3', 'B3', { label: 'C3', colspan: 2 }, 'E3', 'F3', 'G3', 'H3', 'I3', 'J3'],
        ],
      });

      selectCells([[1, 1, 1, 1], [1, 3, 1, 3], [1, 5, 1, 5]]); // B2, B4, B6

      expect(extractDOMStructure(getTopClone())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A1</th>
            <th class="" colspan="4">B1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">F1</th>
            <th class="">G1</th>
            <th class="">H1</th>
            <th class="">I1</th>
            <th class="">J1</th>
          </tr>
          <tr>
            <th class="">A2</th>
            <th class="" colspan="3">B2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">E2</th>
            <th class="">F2</th>
            <th class="">G2</th>
            <th class="">H2</th>
            <th class="">I2</th>
            <th class="">J2</th>
          </tr>
          <tr>
            <th class="">A3</th>
            <th class="ht__highlight">B3</th>
            <th class="ht__highlight" colspan="2">C3</th>
            <th class="hiddenHeader"></th>
            <th class="">E3</th>
            <th class="ht__highlight">F3</th>
            <th class="">G3</th>
            <th class="">H3</th>
            <th class="">I3</th>
            <th class="">J3</th>
          </tr>
        </thead>
        `);

      selectCells([[1, 1, 1, 2], [2, 3, 2, 4]]); // B3 to C2, D3 to E3

      expect(extractDOMStructure(getTopClone())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A1</th>
            <th class="" colspan="4">B1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">F1</th>
            <th class="">G1</th>
            <th class="">H1</th>
            <th class="">I1</th>
            <th class="">J1</th>
          </tr>
          <tr>
            <th class="">A2</th>
            <th class="" colspan="3">B2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">E2</th>
            <th class="">F2</th>
            <th class="">G2</th>
            <th class="">H2</th>
            <th class="">I2</th>
            <th class="">J2</th>
          </tr>
          <tr>
            <th class="">A3</th>
            <th class="ht__highlight">B3</th>
            <th class="ht__highlight" colspan="2">C3</th>
            <th class="hiddenHeader"></th>
            <th class="ht__highlight">E3</th>
            <th class="">F3</th>
            <th class="">G3</th>
            <th class="">H3</th>
            <th class="">I3</th>
            <th class="">J3</th>
          </tr>
        </thead>
        `);
    });

    it('should active highlight column header for selected column headers', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        colHeaders: true,
        nestedHeaders: [
          ['A', { label: 'B', colspan: 8 }, 'C'],
          ['D', { label: 'E', colspan: 4 }, { label: 'F', colspan: 4 }, 'G'],
          ['H', { label: 'I', colspan: 2 }, { label: 'J', colspan: 2 }, { label: 'K', colspan: 2 }, { label: 'L', colspan: 2 }, 'M'],
          ['N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W']
        ]
      });

      $(getCell(-2, 1)) // Header "I"
        .simulate('mousedown')
        .simulate('mouseup');

      expect(extractDOMStructure(getTopClone())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A</th>
            <th class="" colspan="8">B</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">C</th>
          </tr>
          <tr>
            <th class="">D</th>
            <th class="" colspan="4">E</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="4">F</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">G</th>
          </tr>
          <tr>
            <th class="">H</th>
            <th class="ht__active_highlight ht__highlight" colspan="2">I</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">J</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">K</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">L</th>
            <th class="hiddenHeader"></th>
            <th class="">M</th>
          </tr>
          <tr>
            <th class="">N</th>
            <th class="ht__active_highlight ht__highlight">O</th>
            <th class="ht__active_highlight ht__highlight">P</th>
            <th class="">Q</th>
            <th class="">R</th>
            <th class="">S</th>
            <th class="">T</th>
            <th class="">U</th>
            <th class="">V</th>
            <th class="">W</th>
          </tr>
        </thead>
        `);

      expect(getSelected()).toEqual([[0, 1, 9, 2]]);

      $(getCell(-3, 1)) // Header "E"
        .simulate('mousedown')
        .simulate('mouseup');

      expect(extractDOMStructure(getTopClone())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A</th>
            <th class="" colspan="8">B</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">C</th>
          </tr>
          <tr>
            <th class="">D</th>
            <th class="ht__active_highlight ht__highlight" colspan="4">E</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="4">F</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">G</th>
          </tr>
          <tr>
            <th class="">H</th>
            <th class="ht__active_highlight ht__highlight" colspan="2">I</th>
            <th class="hiddenHeader"></th>
            <th class="ht__active_highlight ht__highlight" colspan="2">J</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">K</th>
            <th class="hiddenHeader"></th>
            <th class="" colspan="2">L</th>
            <th class="hiddenHeader"></th>
            <th class="">M</th>
          </tr>
          <tr>
            <th class="">N</th>
            <th class="ht__active_highlight ht__highlight">O</th>
            <th class="ht__active_highlight ht__highlight">P</th>
            <th class="ht__active_highlight ht__highlight">Q</th>
            <th class="ht__active_highlight ht__highlight">R</th>
            <th class="">S</th>
            <th class="">T</th>
            <th class="">U</th>
            <th class="">V</th>
            <th class="">W</th>
          </tr>
        </thead>
        `);

      expect(getSelected()).toEqual([[0, 1, 9, 4]]);

      $(getCell(-4, 1)) // Header "B"
        .simulate('mousedown')
        .simulate('mouseup');

      expect(extractDOMStructure(getTopClone())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A</th>
            <th class="ht__highlight ht__active_highlight" colspan="8">B</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">C</th>
          </tr>
          <tr>
            <th class="">D</th>
            <th class="ht__active_highlight ht__highlight" colspan="4">E</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="ht__active_highlight ht__highlight" colspan="4">F</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">G</th>
          </tr>
          <tr>
            <th class="">H</th>
            <th class="ht__active_highlight ht__highlight" colspan="2">I</th>
            <th class="hiddenHeader"></th>
            <th class="ht__active_highlight ht__highlight" colspan="2">J</th>
            <th class="hiddenHeader"></th>
            <th class="ht__active_highlight ht__highlight" colspan="2">K</th>
            <th class="hiddenHeader"></th>
            <th class="ht__active_highlight ht__highlight" colspan="2">L</th>
            <th class="hiddenHeader"></th>
            <th class="">M</th>
          </tr>
          <tr>
            <th class="">N</th>
            <th class="ht__active_highlight ht__highlight">O</th>
            <th class="ht__active_highlight ht__highlight">P</th>
            <th class="ht__active_highlight ht__highlight">Q</th>
            <th class="ht__active_highlight ht__highlight">R</th>
            <th class="ht__active_highlight ht__highlight">S</th>
            <th class="ht__active_highlight ht__highlight">T</th>
            <th class="ht__active_highlight ht__highlight">U</th>
            <th class="ht__active_highlight ht__highlight">V</th>
            <th class="">W</th>
          </tr>
        </thead>
        `);

      expect(getSelected()).toEqual([[0, 1, 9, 8]]);
    });

    it('should active highlight column header for non-contiguous header selection', () => {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        colHeaders: true,
        nestedHeaders: [
          ['A1', { label: 'B1', colspan: 4 }, 'F1', 'G1', 'H1', 'I1', 'J1'],
          ['A2', { label: 'B2', colspan: 3 }, 'E2', 'F2', 'G2', 'H2', 'I2', 'J2'],
          ['A3', 'B3', { label: 'C3', colspan: 2 }, 'E3', 'F3', 'G3', 'H3', 'I3', 'J3'],
          ['A4', 'B4', { label: 'C4', colspan: 2 }, 'E4', 'F4', 'G4', 'H4', 'I4', 'J4'],
        ],
      });

      $(getCell(-2, 1)) // Header "B2"
        .simulate('mousedown')
        .simulate('mouseup');

      expect(extractDOMStructure(getTopClone())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A1</th>
            <th class="" colspan="4">B1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">F1</th>
            <th class="">G1</th>
            <th class="">H1</th>
            <th class="">I1</th>
            <th class="">J1</th>
          </tr>
          <tr>
            <th class="">A2</th>
            <th class="" colspan="3">B2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">E2</th>
            <th class="">F2</th>
            <th class="">G2</th>
            <th class="">H2</th>
            <th class="">I2</th>
            <th class="">J2</th>
          </tr>
          <tr>
            <th class="">A3</th>
            <th class="ht__active_highlight ht__highlight">B3</th>
            <th class="" colspan="2">C3</th>
            <th class="hiddenHeader"></th>
            <th class="">E3</th>
            <th class="">F3</th>
            <th class="">G3</th>
            <th class="">H3</th>
            <th class="">I3</th>
            <th class="">J3</th>
          </tr>
          <tr>
            <th class="">A4</th>
            <th class="ht__active_highlight ht__highlight">B4</th>
            <th class="" colspan="2">C4</th>
            <th class="hiddenHeader"></th>
            <th class="">E4</th>
            <th class="">F4</th>
            <th class="">G4</th>
            <th class="">H4</th>
            <th class="">I4</th>
            <th class="">J4</th>
          </tr>
        </thead>
        `);

      expect(getSelected()).toEqual([[0, 1, 9, 1]]);

      keyDown('ctrl');

      $(getCell(-3, 5)) // Header "F2"
        .simulate('mousedown')
        .simulate('mouseup');

      expect(extractDOMStructure(getTopClone())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A1</th>
            <th class="" colspan="4">B1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="ht__highlight ht__active_highlight">F1</th>
            <th class="">G1</th>
            <th class="">H1</th>
            <th class="">I1</th>
            <th class="">J1</th>
          </tr>
          <tr>
            <th class="">A2</th>
            <th class="" colspan="3">B2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">E2</th>
            <th class="ht__active_highlight ht__highlight">F2</th>
            <th class="">G2</th>
            <th class="">H2</th>
            <th class="">I2</th>
            <th class="">J2</th>
          </tr>
          <tr>
            <th class="">A3</th>
            <th class="ht__active_highlight ht__highlight">B3</th>
            <th class="" colspan="2">C3</th>
            <th class="hiddenHeader"></th>
            <th class="">E3</th>
            <th class="ht__active_highlight ht__highlight">F3</th>
            <th class="">G3</th>
            <th class="">H3</th>
            <th class="">I3</th>
            <th class="">J3</th>
          </tr>
          <tr>
            <th class="">A4</th>
            <th class="ht__active_highlight ht__highlight">B4</th>
            <th class="" colspan="2">C4</th>
            <th class="hiddenHeader"></th>
            <th class="">E4</th>
            <th class="ht__active_highlight ht__highlight">F4</th>
            <th class="">G4</th>
            <th class="">H4</th>
            <th class="">I4</th>
            <th class="">J4</th>
          </tr>
        </thead>
        `);

      expect(getSelected()).toEqual([
        [0, 1, 9, 1],
        [0, 5, 9, 5],
      ]);

      $(getCell(-3, 1)) // Header "B2"
        .simulate('mousedown')
        .simulate('mouseup');

      expect(extractDOMStructure(getTopClone())).toMatchHTML(`
        <thead>
          <tr>
            <th class="">A1</th>
            <th class="" colspan="4">B1</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="ht__highlight ht__active_highlight">F1</th>
            <th class="">G1</th>
            <th class="">H1</th>
            <th class="">I1</th>
            <th class="">J1</th>
          </tr>
          <tr>
            <th class="">A2</th>
            <th class="ht__active_highlight ht__highlight" colspan="3">B2</th>
            <th class="hiddenHeader"></th>
            <th class="hiddenHeader"></th>
            <th class="">E2</th>
            <th class="ht__active_highlight ht__highlight">F2</th>
            <th class="">G2</th>
            <th class="">H2</th>
            <th class="">I2</th>
            <th class="">J2</th>
          </tr>
          <tr>
            <th class="">A3</th>
            <th class="ht__active_highlight ht__highlight">B3</th>
            <th class="ht__active_highlight ht__highlight" colspan="2">C3</th>
            <th class="hiddenHeader"></th>
            <th class="">E3</th>
            <th class="ht__active_highlight ht__highlight">F3</th>
            <th class="">G3</th>
            <th class="">H3</th>
            <th class="">I3</th>
            <th class="">J3</th>
          </tr>
          <tr>
            <th class="">A4</th>
            <th class="ht__active_highlight ht__highlight">B4</th>
            <th class="ht__active_highlight ht__highlight" colspan="2">C4</th>
            <th class="hiddenHeader"></th>
            <th class="">E4</th>
            <th class="ht__active_highlight ht__highlight">F4</th>
            <th class="">G4</th>
            <th class="">H4</th>
            <th class="">I4</th>
            <th class="">J4</th>
          </tr>
        </thead>
        `);

      expect(getSelected()).toEqual([
        [0, 1, 9, 1],
        [0, 5, 9, 5],
        [0, 1, 9, 1], // <- This coords shouldn't be here (known issue)
        [0, 1, 9, 3],
      ]);
    });

    it('should select every column header under the nested headers, when changing the selection by dragging the cursor', function() {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        colHeaders: true,
        nestedHeaders: [
          ['A', { label: 'B', colspan: 8 }, 'C'],
          ['D', { label: 'E', colspan: 4 }, { label: 'F', colspan: 4 }, 'G'],
          ['H', { label: 'I', colspan: 2 }, { label: 'J', colspan: 2 }, { label: 'K', colspan: 2 }, { label: 'L', colspan: 2 }, 'M'],
          ['N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W']
        ]
      });

      this.$container.find('.ht_clone_top thead tr:eq(2) th:eq(3)')
        .simulate('mousedown');
      this.$container.find('.ht_clone_top thead tr:eq(2) th:eq(5)')
        .simulate('mouseover')
        .simulate('mouseup');

      expect(hot.getSelected()).toEqual([[0, 3, hot.countRows() - 1, 6]]);

      this.$container.find('.ht_clone_top thead tr:eq(2) th:eq(3)')
        .simulate('mousedown');
      this.$container.find('.ht_clone_top thead tr:eq(2) th:eq(1)')
        .simulate('mouseover')
        .simulate('mouseup');

      expect(hot.getSelected()).toEqual([[0, 4, hot.countRows() - 1, 1]]);

      this.$container.find('.ht_clone_top thead tr:eq(2) th:eq(3)').simulate('mousedown');
      this.$container.find('.ht_clone_top thead tr:eq(2) th:eq(1)').simulate('mouseover');
      this.$container.find('.ht_clone_top thead tr:eq(2) th:eq(3)').simulate('mouseover');
      this.$container.find('.ht_clone_top thead tr:eq(2) th:eq(5)').simulate('mouseover');
      this.$container.find('.ht_clone_top thead tr:eq(2) th:eq(5)').simulate('mouseup');

      expect(hot.getSelected()).toEqual([[0, 3, hot.countRows() - 1, 6]]);
    });

    it('should add selection borders in the expected positions, when selecting multi-columned headers', function() {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(4, 10),
        colHeaders: true,
        nestedHeaders: [
          ['A', { label: 'B', colspan: 8 }, 'C'],
          ['D', { label: 'E', colspan: 4 }, { label: 'F', colspan: 4 }, 'G'],
          ['H', { label: 'I', colspan: 2 }, { label: 'J', colspan: 2 }, { label: 'K', colspan: 2 }, { label: 'L', colspan: 2 }, 'M'],
          ['N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W']
        ]
      });

      this.$container.find('.ht_clone_top thead tr:eq(2) th:eq(1)')
        .simulate('mousedown')
        .simulate('mouseup');

      const $headerLvl3 = this.$container.find('.ht_clone_top thead tr:eq(2) th:eq(1)');
      const $firstRow = this.$container.find('.ht_master tbody tr:eq(0)');
      const $lastRow = this.$container.find('.ht_master tbody tr:eq(3)');
      const $tbody = this.$container.find('.ht_master tbody');

      const $topBorder = this.$container.find('.wtBorder.area').eq(0);
      const $bottomBorder = this.$container.find('.wtBorder.area').eq(2);
      const $leftBorder = this.$container.find('.wtBorder.area').eq(1);
      const $rightBorder = this.$container.find('.wtBorder.area').eq(3);

      expect($topBorder.offset().top).toEqual($firstRow.offset().top - 1);
      expect($bottomBorder.offset().top).toEqual($lastRow.offset().top + $lastRow.height() - 1);
      expect($topBorder.width()).toEqual($headerLvl3.width());
      expect($bottomBorder.width()).toEqual($headerLvl3.width());

      expect($leftBorder.offset().left).toEqual($headerLvl3.offset().left);
      expect($rightBorder.offset().left).toEqual($headerLvl3.offset().left + $headerLvl3.width());
      expect($leftBorder.height()).toEqual($tbody.height());
      expect($rightBorder.height()).toEqual($tbody.height() + 1);
    });
  });
});
