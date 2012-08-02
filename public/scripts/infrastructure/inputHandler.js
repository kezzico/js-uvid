function InputHandler() {
  var cursor = -1;
  var rowHeight = 0;
  var _this = {
    getHighlightedRow: getHighlightedRow,
    enableKeyboardControl: enableKeyboardControl,
    disableKeyboardControl: disableKeyboardControl,
    highlightRow: highlightRow,
    keyboardEnabled: true 
  };

  var keys = {
    esc: 27,
    up: 38,
    down: 40,
    pageup: 33,
    pagedown: 34,
    enter: 13,
    remove: 68,
    edit: 69,
    add: 65,
    upload: 85,
    refresh: 82
  }

  $("#deleteFileButton").click(function() {
    if(cursor != -1) removeRow(cursor);
    return false;
  });

  $("#editFileButton").click(function() {
    if(cursor != -1) editRow(cursor);
     return false;
  });

  $("#uploadFileButton").click(function() {
    uploadFile();
    return false;  
  });
  return _this;

  function enableKeyboardControl() {
    _this.keyboardEnabled = true;
    $(document).unbind("keydown").keydown(function(e) {
      switch(e.keyCode) {
        case keys.up: moveCursor(-1); return false;
        case keys.down: moveCursor(1); return false;
        case keys.pagedown: moveCursor(4); return false;
        case keys.pageup: moveCursor(-4); return false;
        case keys.enter: openRow(cursor); return false;
        case keys.remove: removeRow(cursor); return false;
        case keys.add: addFolder(); return false;
        case keys.edit: editRow(cursor); return false;
        case keys.upload: uploadFile(); return false;
        case keys.refresh: location.reload(); return false;
        default: return true;
      }
    });
  }

  function disableKeyboardControl() {
    _this.keyboardEnabled = false; 
    $(document).unbind("keydown");
  }

  function moveCursor(offset) {
    cursor += offset;
    updateCursorPosition();
    adjustPageScroll();
  }
  
  function getNumRows() {
    return $("#library .row").length;
  }

  function openRow(index) {
    $("#library .row").get(index).open(function() {
      cursor = getIndexOfHighlightedRow();
      adjustPageScroll();
    });
  }

  function removeRow(index) {
    var row = $("#library .row").get(index)    
    var message = [
      "Press Ok to delete [", row.getTitle(), "]."
    ].join("");
    
    if(confirm(message)) {
      row.remove();
      updateCursorPosition();
    }
  }
  
  function editRow(index) {
    $("#library .row").get(index).edit();
  }
  
  function addFolder() {
    $("#addFolderButton").click();
  }
  
  function uploadFile() {
    container.selectedFolder.showBrowseDialog();
  }
  
  function updateCursorPosition() {
    var numRows = getNumRows();
    if(cursor >= numRows) cursor = 0;
    else if(cursor < 0) cursor = numRows - 1;
    highlightRow(cursor);
  }

  function adjustPageScroll() {
    if(rowHeight == 0) {
      rowHeight = $("#library .row").outerHeight(true);
    }
    var height = $(window).height();
    document.body.scrollTop = cursor * rowHeight - 256;
  }

  function highlightRow(row) {
    if(row == null) {
      row = cursor = getIndexOfHighlightedRow();
    }
    $("#library .row").removeClass("highlight");    
    if(typeof row == "number") {
      var r = $("#library .row").get(row);
      r.onHighlight();
      $(r).addClass("highlight");
    } else {
      $(row).addClass("highlight")
        .get(0).onHighlight();
      cursor = getIndexOfHighlightedRow();
    }
  }
    
  function getIndexOfHighlightedRow() {
    var row = $("#library .row.highlight").get(0);
    return getIndexOfRow(row);
  }
  
  function getHighlightedRow() {
    return $("#library .row.highlight").get(0);
   
  }
  
  function getIndexOfRow(row) {
    var output = 0;
    $("#library .row").each(function(i, e) {
      if(e == row) output = i;
    });
    
    return output;  
  }
}
