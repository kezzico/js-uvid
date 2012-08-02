var child_process  = require('child_process');

var file = "\"/var/library/20110106/SE07E05 – Denise Handicapped.avi\"";
child_process.exec("aviLength " + file, function(error, stdout) {
  console.log(stdout);
});
