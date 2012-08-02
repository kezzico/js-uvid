function folderBox(row, title) {
  var fileInput = null;
  var _this = container.templates.folderBoxTemplate();
  _this.dropForm = $(_this).find("form.dropForm").get(0);
  
  $(_this).appendTo(row.parent.box).hide();
  
  _this.empty = function() {
    $(_this).find(".row, .folder").remove();
    disableDropInput();
  }

  _this.dragEnter = function() {
    enableDropInput();
    $(row.parent).addClass("fileHovering");  
  }
  
  _this.dragLeave = function() {
    disableDropInput();
    $(row.parent).removeClass("fileHovering");  
  }
  
  setupUploadForm();
  
  return _this;  

  function enableDropInput() {
    $(_this.dropForm.files).removeClass("hidden");
  }
  
  function disableDropInput() {
    $(_this.dropForm.files).addClass("hidden");
  }
  
  function setupUploadForm() {
    disableDropInput();
    _this.dropForm.folder = row;
    $(_this.dropForm.files).change(function() {
      disableDropInput();
      if(container.fileDialog.uploadFormShowing) {
        $(form).find(".uploadForm").remove();
      }
      container.fileDialog.showUploadForm(_this.dropForm, title);
    });

    $(_this.dropForm).submit(function() {
      this.parentId.value = row.getId();
      this.target = "uploadTarget";
      $("#uploadTarget").unbind().load(function() {
        container.fileDialog.afterUpload(_this.dropForm);
      });
      container.fileDialog.beforeSubmit(_this.dropForm);
      setTimeout(function() {
        container.fileDialog.afterSubmit(_this.dropForm);
      }, 100);
    });          
  } 
}