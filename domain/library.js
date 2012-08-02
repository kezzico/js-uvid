var db = require('../database');
var utils = require('../utility');
var child_process  = require('child_process');

exports.addFolder = function(name, parentId, cb) {
  getLibraryCollection(function(library) {
    createUniqueId(function(id) {
      var doc = {
        id: id, 
        parentId: parseInt(parentId), 
        type: 0, 
        name: name
      };
      library.insert(doc, function(error) {
        utils.doCallback(cb(error == null ? id : null));
      });    
    });    
  });
}

exports.addFile = function(fileInfo, cb) {
  getLibraryCollection(function(library) {
    createUniqueId(function(id) {
      var doc = {
        id: id,
        parentId: parseInt(fileInfo.parentId),
        type: 1,
        name: fileInfo.name,
        ep: fileInfo.ep,
        playTime: fileInfo.playTime,
        size: fileInfo.size,
        path: fileInfo.path,
        lastView: null
      };
      
      library.insert(doc, function(error) {
        utils.doCallback(cb(error == null ? id : null));
      });
    });
  });
}

exports.editFile = function(id, fileInfo, cb) {
  getLibraryCollection(function(library) {
    var update = {$set: {ep: fileInfo.ep, name: fileInfo.name}};
    library.update({id: parseInt(id)}, update, {upsert: false}, function(error) {
      utils.doCallback(cb); 
    });
  });
}

exports.getFilePathById = function(id, cb) {
  getLibraryCollection(function(library) {
    library.findOne({id: parseInt(id)}, function(error, file) {
      cb(file.path);
    });
  })
}

exports.getFolderContents = function(id, cb) {
  getLibraryCollection(function(library) {
    var query = {parentId: parseInt(id)};
    var options = {sort: ['type', 'ep', 'name']};
    library.find(query, options, function(error, list) {
      list.toArray(function(error, list) {
        var output = { folders: [ ], files: [ ] };
        for(var i in list) {
          if(list[i].type == 0) {
            output.folders.push(list[i]);
          } else {
            list[i].lastView = utils.formatDate(list[i].lastView);
            output.files.push(list[i]);
          }
        }
        cb(output);
      });
    });
  });
}

exports.removeItem = function(id, cb) {
  var library = null;
  getLibraryCollection(function(l) {
    library = l;
    removeSelfAndChildren(id, cb);
  });
  
  function removeSelfAndChildren(id, cb) {
    library.findOne({id: parseInt(id)}, function(error, file) {
      if(file.type == 0) {
        removeChildren(id, function() {
          removeSelf(id, cb)
        });
      } else {
        var cmd = "rm \"" + file.path +"\"";
        console.log("deleting "+ file.path);
        child_process.exec(cmd);
        removeSelf(id, cb);
      }
    });
  }
  
  function removeChildren(parentId, cb) {
    library.find({parentId: parseInt(parentId)}, function(error, list) {
      list.toArray(function(error, list) {
        if(list.length == 0) utils.doCallback(cb);
        var j = 0;
        for(var i in list) {
          removeSelfAndChildren(list[i].id, function() {
            if(++j == list.length) {
              utils.doCallback(cb(error));
            }
          });
        }
      });
    });  
  }
  
  function removeSelf(id, cb) {
    console.log("removing " + id);
    library.remove({id: parseInt(id)}, function(error) {
      utils.doCallback(cb(error));
    });  
  }
}

exports.calculatePlayTime = function(file, cb) {
  var cmd = "aviLength \"" + file +"\"";
  child_process.exec(cmd, function(error, stdout) {
    var seconds = parseInt(stdout);
    
    if(seconds < 0 || seconds > 30000) {
      seconds = 0;
    }
    
    var playTime = [
      utils.pad2(Math.floor(seconds / 60)), ":", utils.pad2(seconds % 60)
    ].join("");
    
    utils.doCallback(cb, playTime);
  });
}

exports.updateLastPlayed = function(id, cb) {
  getLibraryCollection(function(library) {    
    var query = {id: parseInt(id)};
    var update = {$set: {lastView: new Date()}};
    library.update(query, update, {upsert: false}, function(error) {
      utils.doCallback(cb); 
    });
  });
}

function createUniqueId(cb) {
  db.getCollection("seq", function(seq) {
    var sort = ['n','descending'];
    var query = {name:'uniqueId'};
    var update = {$inc: {n: 1}};
    seq.findAndModify(query, sort, update, 
    function(error, folderId) {
      cb(folderId.n);
    });
  });
}

function getLibraryCollection(cb) {
  db.getCollection("library", function(folders) {
    cb(folders);
  }); 
}
