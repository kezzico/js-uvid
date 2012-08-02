function File(id, title, ep, lastView, length, parent) {
  var _this = createFileElement();
  _this.getId = function() { return id; }  
  _this.getTitle = function() { return title; }
  
  _this.open = function(callback) {
    $.post("/playFile", {id: id}, function() {
      parent.refresh();
      if(typeof callback == "function") {
        callback();
      }
    });
  }
  
  _this.download = function() {
    window.location = "/download?id="+id;
  }

  _this.edit = function() {
    container.inputHandler.disableKeyboardControl();
    var season = ep.split("E")[0].substring(1);
    var episode = ep.split("E")[1];
    var editRow = container.templates.editFileRowTemplate();
    $(editRow)
      .find(".title input").val(title).end()
      .find("input.season").val(season).end()
      .find("input.ep").val(episode).end()
      .find(".lastView").html(lastView).end()
      .find(".length").html(length).end()
      .find(".cancelBtn").click(function() {
        $(editRow).remove();        
        $(_this).show();
        container.inputHandler.enableKeyboardControl();        
      }).end()
      .submit(function() {
        var data =  {
          id: id,
          name: this.title.value, 
          ep: this.ep.value,
          season: this.season.value
        };
        
        $.post("/editFile", data, function() {
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
  
  _this.remove = function(callback) {
    $(_this).remove();
    $.post("/removeFile", {id: id}, null);
  }
  
  _this.onHighlight = function() {
    $("#playFileButton").show().unbind()
      .click(function() {
        if(container.inputHandler.keyboardEnabled == false) return;
        _this.open();
        return false;
      });
    $("#downloadFileButton").show().unbind()
      .click(function() {
        if(container.inputHandler.keyboardEnabled == false) return;
        _this.download();
        return false;
      });
  }
  
  function createFileElement() {
    lastView = lastView == null ? "-" : lastView
    var row = container.templates.fileTemplate();
    $(row).attr("id", "row"+id)
      .find(".title").html(title).end()
      .find(".ep").html(ep).end()
      .find(".lastView").html(lastView).end()
      .find(".length").html(length).end()
      .click(function() { 
        container.inputHandler.highlightRow(_this);
        return false;
      });

    $(parent.box).append(row);
    return row;
  }
}
