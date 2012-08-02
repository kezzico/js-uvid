function Folder(id, title, parent) {
  var isOpen = false;
  var isLoading = false;
  
  var _this = createRow();  
  _this.getId = function() { return id; }  
  _this.getTitle = function() { return title; }
  _this.getType = function() { return "file" }  
  _this.parent = parent;
  _this.box = folderBox(_this, title);
  
  _this.open = function(cb) {
    if(isLoading == true) return;
    if(isOpen) { _this.close(); return; }
    
    isLoading = true;
    container.inputHandler.disableKeyboardControl();
    if(container.dragMode == false) {
      closeAdjacentFolders();
    }
    showOpenedIcon();

    getFolderContents(function(d) {
      appendFolders(d.folders);
      appendFiles(d.files);
      container.selectedFolder = _this;      
      $(_this.box).show(200, function() {
        isOpen = true;
        isLoading = false;

        container.inputHandler.enableKeyboardControl();
        container.inputHandler.highlightRow();
        if(typeof callback == "function") cb();
      });
    });
  }
  
  _this.close = function() {
    if(isOpen == false) return;  
    isOpen = false;
    isLoading = true;
    if(container.selectedFolder == _this) {
      container.selectedFolder = parent;
    }
    container.inputHandler.highlightRow();
    showClosedIcon();
    $(_this.box).hide(200, function() { 
      _this.box.empty();
      isLoading = false; 
    });
  }
  
  _this.refresh = function(cb) {
    if(isOpen == false || isLoading == true) return;
    isLoading = true;
    
    var hlRowId = "#row" + container.inputHandler.getHighlightedRow().getId();   
    getFolderContents(function(d) {
      _this.box.empty();
      appendFolders(d.folders);
      appendFiles(d.files);
      
      isLoading = false;
      container.selectedFolder = _this;
      
      container.inputHandler.highlightRow(hlRowId);
      if(typeof cb == "function") cb();
    });    
  }
  
  _this.edit = function() {
    container.inputHandler.disableKeyboardControl();
    var editRow = container.templates.editFolderTemplate();
    
    $(editRow)
      .find(".title input").val(title).end()
      .find(".cancelBtn").click(function() {
        $(editRow).remove();        
        $(_this).show();
        container.inputHandler.enableKeyboardControl();        
      }).end()
      .submit(function() {
        var data =  {
          id: id,
          name: this.title.value, 
        };
        
        $.post("/editFolder", data, function() {
          container.inputHandler.enableKeyboardControl();
          container.inputHandler.highlightRow(parent);
          $(editRow).remove();
          parent.refresh();
        });
        
        return false;
      });
    
    $(_this).after(editRow);
    $(_this).hide();
    editRow.title.focus();
  }
  
  _this.remove = function() {
    if(container.selectedFolder == _this) {
      container.selectedFolder = parent;
    }
  
    $(_this).remove();
    $(_this.box).remove();
    $.post("/removeFolder", {id: id}, null)
  }
    
  _this.showBrowseDialog = function() {
    $(_this.box.dropForm.files).show();
    _this.box.dropForm.files.click();
    return false;
  }
  
  _this.onHighlight = function() {
    $("#playFileButton").hide();
    $("#downloadFileButton").hide();    
  }
  
  return _this;
    
  function getFolderContents(cb) {
    $.post("/library", {id: id}, function(data) {
      var d = eval(data);
      if(typeof cb == "function") cb(d);
    });
  }
  
  function createRow() {
    if(title == null) return { };

    var row = container.templates.folderTemplate();
    $(row).attr("id", "row"+id)
      .find(".title").html(title).end()
      .click(function() { 
        if(container.inputHandler.keyboardEnabled == false) return;
        if(isOpen == false) _this.open();
        else _this.close();
        container.inputHandler.highlightRow(_this);
        
        return false;
      });
      
    $(parent.box).append(row);
    return row;
  }
    
  function showOpenedIcon() {
    $(_this).find(".icon")
      .addClass("folderOpenIcon")
      .removeClass("folderIcon");
  }
  
  function showClosedIcon() {
    $(_this).find(".icon")
      .addClass("folderIcon")
      .removeClass("folderOpenIcon");    
  }
      
  function appendFolders(folders) {
    for(var i=0;i<folders.length;i++) {
      var folderId = folders[i].id;
      var folderTitle = folders[i].name;
      Folder(folderId, folderTitle, _this);
    }
  }
  
  function appendFiles(files) {
    for(var i=0;i<files.length;i++) {
      var f = files[i];
      File(f.id, f.name, f.ep, f.lastView, f.playTime, _this);
    }    
  }
  
  function closeAdjacentFolders() {
    if(parent == null) return;
    $(parent.box).find(".folderRow").each(function() {
      if(this != _this) {
        this.close();
      }
    });
  }
}
