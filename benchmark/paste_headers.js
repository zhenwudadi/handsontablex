/**
 * I use it to measure how long does it take to paste big chunk of data into the table (WITH row/col headers)
 *
 * rev                                      | date (dd.mm.yy) | performance                           | desc
 * -----------------------------------------|-----------------|---------------------------------------|------------------------------------------------------
 * ddc33968f53a8767fb9e7e414bf09cd8bea8285e | 27.06.12 10:54  | XXX (crashes Firefox and Chrome)      | initial benchmark forked from paste.html, with row/col headers added
 *
 * cheers
 * Marcin
 */
$(window).load(function () {
  var suite = new Benchmark.Suite;
  var container;
  container = $('<div class="dataTable">');
  $("body").append(container);

  suite.add('Paste test', {
    'defer': true,
    minSamples: 20,
    'fn': function (deferred) {
      if (container) {
        container.remove();
      }
      container = $('<div class="dataTable">');
      $("body").append(container);

      container.handsontable({
        rows: 5,
        cols: 5,
        rowHeaders: true,
        colHeaders: true,
        minSpareCols: 1, //always keep at least 1 spare row at the right
        minSpareRows: 1, //always keep at least 1 spare row at the bottom
        contextMenu: true,
        onChange: function () {
          deferred.resolve();
        }
      });

      container.find('td:first').trigger('mousedown');
      container.find('td:first').trigger('mouseup');
      container.find('textarea').val(bigdataStr).trigger('paste');
    }})
      .on('cycle', function (event) {
        $("body").prepend($('<div>' + String(event.target) + '</div>'));
      })
      .run({async: true});
});