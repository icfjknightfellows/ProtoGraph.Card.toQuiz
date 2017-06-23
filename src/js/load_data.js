import Tabletop from 'tabletop'

function loadSheetData(url, callback){
  Tabletop.init({
    key: url,
    callback: callback,
    parseNumbers: true,
    // simpleSheet: true
  });
}

function loadJSON(url, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == "200") {
        callback(JSON.parse(xobj.responseText));
      }
    };
    xobj.send(null);
}

module.exports = {
  loadSheetData: loadSheetData,
  loadJSON: loadJSON
}