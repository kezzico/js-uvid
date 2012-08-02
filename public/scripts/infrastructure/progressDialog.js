function ProgressDialog() {

  var _this = { };
  var progressChecker = null;
  _this.hideDialog = function() {
    $("#progressFrame").hide();
    if(progressChecker) {
      clearInterval(progressChecker);
    }
  }
  
  _this.showDialog = function() {
    setProgress(0, "");
    $("#progressFrame").show();
    progressChecker = setInterval(checkProgress, 2000);
  }
  
  _this.hideDialog();
  return _this;
  
  function checkProgress() {
    $.get("/uploadProgress", null, function(p) {
      setProgress(p);
    });  
  }
  
  function setProgress(total) {
    total = total + "%";
    $("#progressBar .progress").html(total)
      .css("width", total);
  }
}