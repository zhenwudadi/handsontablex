/**
 * HandsontableManualColumnMove
 *
 * Has 2 UI components:
 * - handle - the draggable element that sets the desired position of the column
 * - guide - the helper guide that shows the desired position as a vertical guide
 *
 * Warning! Whenever you make a change in this file, make an analogous change in manualRowMove.js
 * @constructor
 */
(function (Handsontable) {
function HandsontableManualColumnMove() {
  var startCol
    , endCol
    , startX
    , startOffset
    , currentCol
    , instance
    , currentTH
    , handle = document.createElement('DIV')
    , guide = document.createElement('DIV')
    , eventManager = Handsontable.eventManager(this);

  handle.className = 'manualColumnMover';
  guide.className = 'manualColumnMoverGuide';

  var saveManualColumnPositions = function () {
    var instance = this;
    Handsontable.hooks.run(instance, 'persistentStateSave', 'manualColumnPositions', instance.manualColumnPositions);
  };

  var loadManualColumnPositions = function () {
    var instance = this;
    var storedState = {};
    Handsontable.hooks.run(instance, 'persistentStateLoad', 'manualColumnPositions', storedState);
    return storedState.value;
  };

  function setupHandlePosition(TH) {
    instance = this;
    currentTH = TH;

    var col = this.view.wt.wtTable.getCoords(TH).col; //getCoords returns WalkontableCellCoords
    if (col >= 0) { //if not row header
      currentCol = col;
      var box = currentTH.getBoundingClientRect();
      startOffset = box.left;
      handle.style.top = box.top + 'px';
      handle.style.left = startOffset + 'px';
//      instance.rootElement[0].appendChild(handle);
      instance.rootElement.appendChild(handle);
    }
  }

  function refreshHandlePosition(TH) {
    var box = TH.getBoundingClientRect();
    handle.style.left = box.left + 'px';
  }

  function setupGuidePosition() {
    var instance = this;
    Handsontable.Dom.addClass(handle, 'active');
    Handsontable.Dom.addClass(guide, 'active');
    var box = currentTH.getBoundingClientRect();
    guide.style.width = box.width + 'px';
    guide.style.height = instance.view.maximumVisibleElementHeight(0) + 'px';
    guide.style.top = handle.style.top;
    guide.style.left = startOffset + 'px';
//    instance.rootElement[0].appendChild(guide);
    instance.rootElement.appendChild(guide);
  }

  function refreshGuidePosition(diff) {
    guide.style.left = startOffset + diff + 'px';
  }

  function hideHandleAndGuide() {
    Handsontable.Dom.removeClass(handle, 'active');
    Handsontable.Dom.removeClass(guide, 'active');
  }

  var checkColumnHeader = function (element) {
    if (element.tagName != 'BODY') {
      if (element.parentNode.tagName == 'THEAD') {
        return true;
      } else {
        element = element.parentNode;
        return checkColumnHeader(element);
      }
    }
    return false;
  };

  var getTHFromTargetElement = function (element) {
    if (element.tagName != 'TABLE') {
      if (element.tagName == 'TH') {
        return element;
      } else {
        return getTHFromTargetElement(element.parentNode);
      }
    }
    return null;
  };

  var bindEvents = function () {

    var instance = this;
    var pressed;

//    eventManager.addEventListener(instance.rootElement[0],'mouseover',function (e) {
    eventManager.addEventListener(instance.rootElement,'mouseover',function (e) {
        if (checkColumnHeader(e.target)){
          var th = getTHFromTargetElement(e.target);
          if (th) {
            if (pressed) {
              endCol = instance.view.wt.wtTable.getCoords(th).col;
              refreshHandlePosition(e.target);
            }
            else {
              setupHandlePosition.call(instance, th);
            }
          }
        }
    });

//    eventManager.addEventListener(instance.rootElement[0],'mousedown', function (e) {
    eventManager.addEventListener(instance.rootElement,'mousedown', function (e) {
      if (Handsontable.Dom.hasClass(e.target, 'manualColumnMover')){
        startX = e.pageX;
        setupGuidePosition.call(instance);
        pressed = instance;

        startCol = currentCol;
        endCol = currentCol;
      }
    });

    eventManager.addEventListener(window,'mousemove',function (e) {
      if (pressed) {
        refreshGuidePosition(e.pageX - startX);
      }
    });


    eventManager.addEventListener(window,'mouseup',function (e) {
      if (pressed) {
        hideHandleAndGuide();
        pressed = false;

        if (startCol < endCol) {
          endCol--;
        }
        createPositionData(instance.manualColumnPositions, instance.countCols());
        instance.manualColumnPositions.splice(endCol, 0, instance.manualColumnPositions.splice(startCol, 1)[0]);

        instance.forceFullRender = true;
        instance.view.render(); //updates all

        saveManualColumnPositions.call(instance);

        Handsontable.hooks.run(instance, 'afterColumnMove', startCol, endCol);

        setupHandlePosition.call(instance, currentTH);
      }
    });

    instance.addHook('afterDestroy', unbindEvents);
  };

  var unbindEvents = function(){
//    var instance = this;

//    var eventManager = Handsontable.eventManager(instance);
    eventManager.clear();

//    instance.rootElement.off('mouseenter.manualColumnMove.' + instance.guid, 'table thead tr > th');
//    instance.rootElement.off('mousedown.manualColumnMove.' + instance.guid, '.manualColumnMover');
//    $window.off('mousemove.manualColumnMove.' + instance.guid);
//    $window.off('mouseup.manualColumnMove.' + instance.guid);
  };

  var createPositionData = function (positionArr, len) {
    if (positionArr.length < len) {
      for (var i = positionArr.length; i < len; i++) {
        positionArr[i] = i;
      }
    }
  };

  this.beforeInit = function () {
    this.manualColumnPositions = [];
  };

  this.init = function (source) {
    var instance = this;

    var manualColMoveEnabled = !!(this.getSettings().manualColumnMove);

    if (manualColMoveEnabled) {
      var initialManualColumnPositions = this.getSettings().manualColumnMove;

      var loadedManualColumnPositions = loadManualColumnPositions.call(instance);

      if (typeof loadedManualColumnPositions != 'undefined') {
        this.manualColumnPositions = loadedManualColumnPositions;
      } else if (initialManualColumnPositions instanceof Array) {
        this.manualColumnPositions = initialManualColumnPositions;
      } else {
        this.manualColumnPositions = [];
      }

      if (source == 'afterInit') {
        bindEvents.call(this);
        if (this.manualColumnPositions.length > 0) {
          this.forceFullRender = true;
          this.render();
        }
      }

    } else {
      unbindEvents.call(this);
      this.manualColumnPositions = [];
    }
  };

  this.modifyCol = function (col) {
    //TODO test performance: http://jsperf.com/object-wrapper-vs-primitive/2
    if (this.getSettings().manualColumnMove) {
      if (typeof this.manualColumnPositions[col] === 'undefined') {
        createPositionData(this.manualColumnPositions, col + 1);
      }
      return this.manualColumnPositions[col];
    }
    return col;
  };

}
var htManualColumnMove = new HandsontableManualColumnMove();

Handsontable.hooks.add('beforeInit', htManualColumnMove.beforeInit);
Handsontable.hooks.add('afterInit', function () {
  htManualColumnMove.init.call(this, 'afterInit')
});

Handsontable.hooks.add('afterUpdateSettings', function () {
  htManualColumnMove.init.call(this, 'afterUpdateSettings')
});
Handsontable.hooks.add('modifyCol', htManualColumnMove.modifyCol);

Handsontable.hooks.register('afterColumnMove');

})(Handsontable);


