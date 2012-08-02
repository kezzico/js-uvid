var formidable = require('formidable')
    fs = require('fs'),

exports.doCallback = doCallback;
exports.generateRandomNumber = generateRandomNumber;
exports.getMultipartForm = getMultipartForm;
exports.renameFile = renameFile;
exports.pad2 = pad2;
exports.formatDate = formatDate;

function formatDate(date) {
  if(date != null) {
    return [ 
      pad2(date.getMonth()+1), 
      date.getDate(), 
      date.getFullYear() 
    ].join("-");
  }
  
  return null;
}
function doCallback(callback, argument) {
  if(typeof callback == "function") {
    callback(argument);
  }
}

function generateRandomNumber(min, max) {
  if(min > max) throw "min is greater than max";
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getMultipartForm(req, onProgress, cb) {
  var form = new formidable.IncomingForm(), numFiles = 0;
  form.uploadDir = '/var/library/';
    
  var data = {
    files: [ ]
  };

  form.on("progress", function(bytesReceived, bytesExpected) {
    progress = (bytesReceived / bytesExpected * 100).toFixed(2);
    doCallback(onProgress, progress);
  });
    
  form.on('field', function(field, value) {
    var fields = field.split("/")
    var next = data;
    for(var i=0;i<fields.length;i++) {
      if(next[fields[i]] != null) {
        next = next[fields[i]];
      } else if (i != fields.length - 1) {
        next = next[fields[i]] = { };
      } else {
        next[fields[i]] = value;
      }
    }
  });
  
  form.on('file', function(fileName, fileInfo) {
    data.files[numFiles++] = fileInfo;
  });
  
  form.parse(req, function(err) { 
    doCallback(cb, data) 
  });
}

function pad2(n) {
  if(n != null && n != "") {
    if((""+n).length >= 2) return n;    
    return "0"+n;
  }
  
  return "00";
}

function renameFile(oldname, newname) {
  if(newname != null && oldname != null) {
    var date = new Date()
    var folderName = [
      "/var/library/",
      date.getUTCFullYear(),
      pad2(date.getUTCMonth() + 1),
      pad2(date.getUTCDate())
    ].join('');
    
    newname = [
      folderName, "/", newname.replace("/", "")
    ].join('');
    
    try {
      fs.mkdirSync(folderName, 755)
    } catch(e) { }
    
    try {
      fs.renameSync(oldname, newname);
    } catch(e) {
      console.log("failed to rename " + oldname + " to " + newname + e);
    }
  }
  
  return newname;
}
