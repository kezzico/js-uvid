var container = { 
  inputHandler: null,
  templates: null,
  fileDialog: null,
  folderDialog: null,
  selectedFolder: null,
  progressDialog: null,
  dragMode: false
};

$(document).ready(function() {  
	container.templates = {
		folderTemplate: function() { 
			return $("#folderTemplate").clone().get(0);
		},
		
		folderBoxTemplate: function() {
		  return $("#folderBoxTemplate").clone()
		    .attr("id", "").get(0);
		},
		
		fileTemplate: function() {
			return $("#fileTemplate").clone().get(0);
		},
		
		uploadFormTemplate: function() {
		  return $("#uploadForm").clone()
		    .attr("id", "").get(0);
		},
		
		uploadFormRowTemplate: function() {
		  return $("#uploadFormRow").clone()
		    .attr("id", "").get(0);
		},
		
		createFolderTemplate: function() {
      return $("#createFolderRow").clone()
        .attr("id", "").addClass("createFolderClone").get(0);
		},

		editFolderTemplate: function() {
      return $("#editFolderTemplate").clone()
        .attr("id", "").get(0);
		},

		editFileRowTemplate: function() {
      return $("#editFileTemplate").clone()
        .attr("id", "").get(0);
		}		
	}
		
  container.inputHandler = InputHandler();
  container.fileDialog = FileDialog();
  container.folderDialog = FolderDialog();  
  container.progressDialog = ProgressDialog();
  var root = Folder(1, null, {box: $("#library").get(0)});
  container.selectedFolder = root;
  root.open();
  var dragCounter = 0;
  document.body.ondragenter = function() {
    dragCounter++;
    container.selectedFolder.box.dragEnter();
  }

  document.body.ondragleave = function() {  
    dragCounter--;
    if(dragCounter <= 0) {
      dragCounter = 0;
      container.selectedFolder.box.dragLeave();
    }
  }
  
  var platform = navigator.platform;
  if(platform == 'iPad' || platform == 'iPhone' || platform == 'iPod') {
      $("#footer")
        .css("position", "absolute")
        .css("bottom", "auto");
      var footerHeight = $("#footer").height();
      
      setFooterPosition();
      window.onscroll = setFooterPosition;
      
      function setFooterPosition() {
        var scrollTop = document.body.scrollTop;
        var windowHeight = window.innerHeight;
        var offset = (scrollTop + (windowHeight - footerHeight));
        $("#footer").css("top", offset + "px");
      }
  }
  
  if(new String(window.location).indexOf("localhost") != -1) {
    $("body").css("overflow", "hidden");
  }
});

