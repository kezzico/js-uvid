function FileDialog() {
  var _this = {
    uploadFormShowing: false,
    afterSubmit: afterSubmit,
    showUploadForm: showUploadForm,
    beforeSubmit: beforeSubmit,
    afterUpload: afterUpload
  };

  $("#fileDialog").hide();  
    
  return _this;
  
  function showUploadForm(form, title) {
    _this.uploadFormShowing = true;
    container.inputHandler.disableKeyboardControl();
    var numFiles = form.files.files.length;
    
    $(form).show()
      .find("input[type=file]").addClass("hidden").end()
      .append(container.templates.uploadFormTemplate())
      .find(".cancelBtn")
        .click(function() { hideUploadForm(form); })
      .end();
    
    for(var i=0;i<numFiles;i++) {
      var name = form.files.files[i].name
      var prefix = "fileInfo/"+name+"/";
      var row = container.templates.uploadFormRowTemplate();
      var info = decodeFileInfo(name, title);
      $(row)
        .find(".title input")
          .attr("name", prefix+"title")
          .val(info.fullTitle)
        .end()
        .find("input.season")
          .attr("name", prefix+"season")
          .val(info.season)
        .end()
          .find("input.ep")
          .attr("name", prefix+"ep")
          .val(info.ep)
        .end();
      $(form).find(".uploadRows").append(row);
    }
  }
  
  function hideUploadForm(form) {
    _this.uploadFormShowing = false;
    $(form).find(".uploadForm").remove();
    $(form.files).addClass("hidden").val("");
    container.inputHandler.enableKeyboardControl()
  }
  
  function beforeSubmit(form) {
    container.progressDialog.showDialog();
  }
  
  function afterSubmit(form) {
    hideUploadForm(form);    
  }
  
  function afterUpload(form) {
    setTimeout(container.progressDialog.hideDialog, 500);
    container.inputHandler.enableKeyboardControl();
    form.folder.refresh();
  }
}