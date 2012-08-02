var express = require('express'),
    connect = require('connect'),
    database = require('./database'),
    library = require('./domain/library'),
    util = require('./utility'),
    async = require('async'),
    fs = require('fs'),
    exec  = require('child_process').exec;

var server = function() {
  var server = express.createServer();
  
  server.use(connect.compiler({ src: __dirname + '/public', enable: ['less'] }));
  server.use(connect.staticProvider(__dirname + '/public'));
  
  server.use(connect.bodyDecoder());
  server.use(connect.methodOverride());
  server.use(server.router);
  server.use(connect.errorHandler({ dumpExceptions: true, showStack: true }));
  database.connect('localhost', 27017, 'uvid', function() {
    server.listen(80);
  });

  return server; 
}();

server.post("/library", function(req, res) {
  library.updateLastPlayed(req.body.id);
  library.getFolderContents(req.body.id, function(folder) {
    res.send(folder);
  });
});

server.post("/addFolder", function(req, res) {
  var name = req.body.name;
  var folderId = req.body.folderId;
  library.addFolder(name, folderId, function() {
    res.send({});
  });
});

server.post("/removeFolder", function(req, res) {
  //delete files and remove child folders
  library.removeItem(req.body.id, function(error) {
    res.send({});
  });
});

server.post("/removeFile", function(req, res) {
  library.removeItem(req.body.id, function(error) {
    res.send({});
  });
});

server.post("/playFile", function(req, res) {
  library.updateLastPlayed(req.body.id);
  library.getFilePathById(req.body.id, function(path) {
    console.log(path);
    exec('killall mplayer', function() {
      exec('DISPLAY=:0 mplayer "' + path +'"');    
    });
  });
  res.send({});
});

server.post("/editFolder", function(req, res) {
  library.editFile(req.body.id, { name: req.body.name}, 
    function() { res.send({}); });
});

server.post("/editFile", function(req, res) {
  var ep = [
    "S", util.pad2(req.body.season),
    "E", util.pad2(req.body.ep)
  ].join("");

  library.editFile(req.body.id, { name: req.body.name, ep: ep }, 
    function() { res.send({}); });
});

server.get("/download", function(req, res) {
  library.getFilePathById(req.query.id, function(filePath) {  
    var fileName = filePath.replace(/.*\//, "");

    fs.readFile(filePath, function(err, data){
      if(err) {
        res.writeHead("404");
      } else {
        res.writeHead('200', {
          'Content-Type': 'video/x-msvideo',
          'Content-Disposition': "filename="+fileName,
          'Content-Length': data.length
        });
        res.write(data);
      }
      res.end();
    });
  });
});

server.post("/upload", function(req, res) {
  progress = 0;
  util.getMultipartForm(req, uploadProgress, function(form) {
    async.forEach(form.files, function(file, cb) {
      file.path = util.renameFile(file.path, file.filename);
      if(file.path.match(/.srt$/)) {
        res.send({}); return;
      }
      
      library.calculatePlayTime(file.path, function(playTime) {
        var name = file.filename;
        
        var ep = [
          "S", util.pad2(form.fileInfo[name].season),
          "E", util.pad2(form.fileInfo[name].ep)
        ].join("");
        
        var fileInfo = {
          parentId: form.parentId, 
          path: file.path,      
          size: file.length,        
          name: form.fileInfo[name].title,
          ep: ep,
          playTime: playTime
        };
          
        library.addFile(fileInfo, cb);
      });
    }, function() { 
      setTimeout(function() { res.send({}); }, 2000); 
    })
  });
});

var progress = 0;
function uploadProgress(p) {
  progress = p;
}

server.get("/uploadProgress", function(req, res) {
  res.send(progress.toString());
});