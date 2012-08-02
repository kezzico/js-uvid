function FolderDialog() {

  $("#addFolderButton").click(function() {
    hideFolderDialog();
    var row = container.templates.createFolderTemplate();
    container.inputHandler.disableKeyboardControl();
    $(container.selectedFolder.box).append(row);    
    $(row).submit(function() {
      var post = {
        folderId: container.selectedFolder.getId(),
        name: this.newFolderName.value      
      };
      
      $.post("/addFolder", post, function() {
        hideFolderDialog();
        container.selectedFolder.refresh();
      });
      
      return false;
    }).find(".cancel").click(function() {
      hideFolderDialog();
      return false;
    });
      
    row.newFolderName.focus();
    return false;
  });
    
  function hideFolderDialog() {
    $(".createFolderClone").remove();
    container.inputHandler.enableKeyboardControl();
  };
}