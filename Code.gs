function tableAxis(name, labelElements, keyIndex, keyGenerator) {
  var r;
  
  r = {name: name,
       labels: labelElements,
       girth: labelElements[0].length,
       keyIndex: keyIndex,
       keyGenerator : keyGenerator
      };
  Object.freeze(r);
  
  return r;
}

function contentAxis(name, content, keyGenerator, subKeyGenerator) {
  var r;
  var labels = [];
  var index = {};
  
  var keyGrid = function(key, subKeys) {
    return _._map(subKeys, function(x, i) { 
      if (i===0) {
        return [key, x];
      }
      else {
        return ["", x];
      }
    });
  };
  
  content.reduce(function(acc, x) {
    var key = keyGenerator(x);
    if (typeof(index[key]) !== "number") {
      //var keyGrid = keyGridElementGenerator(x);
      index[key] = acc.length;

      if (typeof(subKeyGenerator) === "function") {
        var keys = keyGrid(key, subKeyGenerator(x));
        keys.reduce(function(acc2, x2) { acc2[acc2.length] = x2; return acc2}, acc);
        //Logger.log("-->psk[%s]", acc);
      }
      else {
        acc[acc.length] = [key];
      }
    }
    return acc;
  }, labels);
  
  return tableAxis(name, labels, index, keyGenerator);
}

function dateAxis(name, startTime, endTime, keyGenerator) {
  var dateList = function(startTime, endTime) {
    // return _._times((endTime.getTime()-startTime.getTime())/1000/60/60/24, function(n) { return new Date(startTime,getTime() + (n-1)* 24 * 3600 * 1000) };
    var r = [], t = startTime;
    while (t < endTime) {
      r[r.length] = [t.getDate() + "/" + (t.getMonth() + 1)];
      t = new Date(t.getTime() + 24 * 60 * 60 * 1000);
    }
    return r;
  };
  var labels = dateList(startTime, endTime);
  var index = labels.reduce(function(acc, x, i) { acc[x] = i; return acc }, {});
  var keyTranslator = function(element) {
    var time = keyGenerator(element);
    return time.getDate() + "/" + (time.getMonth() + 1);
  }
  return tableAxis(name, labels, index, keyTranslator);
}

function filledArray(size, x) {
  return Array.apply(null, Array(size)).map(String.prototype.valueOf, x);
}
  
function objectTable(title, hozAxis, vertAxis, renderer, content) {
  var table = [], r;
  
  var initTableRow = function(hozAxis, table, leftLabels) {
    table[table.length] = leftLabels.concat(_._map(hozAxis.labels, function(x) { return "-"; }));
    return table;
  };

  var setTableCell = function(table, element, hozAxis, vertAxis, renderer) {
    var row = vertAxis.keyIndex[vertAxis.keyGenerator(element)] + hozAxis.girth;
    var col = hozAxis.keyIndex[hozAxis.keyGenerator(element)] + vertAxis.girth;
    var cellData = renderer(element);
    
    if (Array.isArray(cellData)) {
      cellData.reduce(function(acc, x, i) {
        acc[row + i][col] = x;
        return acc;
      }, table);
    }
    else {
      table[row][col] = renderer(element);
    }
    
    return table;
  };
  
  var initTableHozAxis = function(table, labelsIndex, labels) {
    labels.reduce(function(acc, x, labelsIndex) { 
      acc[labelsIndex] = acc[labelsIndex].concat(x); 
      return acc;
    }, table);
    //table[row] = .concat(gridElements);
    return table;
  };
  
  var initTopRows = function(hozAxis, vertAxis, table) {
    // pad the left rows to the width of the vertical axis labels
    hozAxis.labels[0].reduce(function(acc, x, i) { 
      acc[i] = filledArray(vertAxis.girth, "");
      return acc;
    }, table);
    
    // Render the horizontal axis labels
    hozAxis.labels.reduce(function(acc, x, i) { return initTableHozAxis(acc, i, x); }, table);
  };
  
  var initLeftColumns = function(hozAxis, vertAxis, table) {
    vertAxis.labels.reduce(function(acc, x) { return initTableRow(hozAxis, acc, x); }, table);
  }
  
  var fillTableContent = function(hozAxis, vertAxis, table, content, renderer) {
    content.reduce(function(acc, x) { return setTableCell(acc, x, hozAxis, vertAxis, renderer); }, table); // Fill Cells
  };
  
  initTopRows(hozAxis, vertAxis, table);
  initLeftColumns(hozAxis, vertAxis, table);
  fillTableContent(hozAxis, vertAxis, table, content, renderer);
  
  r = {title: title,
       table: table,
       height: table.length,
       width: table[0].length,
       headerSize: hozAxis.girth,
       hozAxis: hozAxis,
       vertAxis: vertAxis
      };
  Object.freeze(r);
  
  return r;
}
