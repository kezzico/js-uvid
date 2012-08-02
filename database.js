var MongoDb = require('mongodb/db').Db,
    Server = require('mongodb/connection').Server,
    util = require('./utility'),
    db = null;

exports.connect = function(host, port, database, callback) {
  var server = new Server(host, port, {auto_reconnect: true}, {})
  db = new MongoDb(database, server);
  
  var timeout = setTimeout(function() {
    util.doCallback(callback(false));  
  }, 5000);
  
  db.open(function(status) {
    clearTimeout(timeout);
    util.doCallback(callback(true));
  });
} 

exports.disconnect = function() {
  db.close();
}

exports.getCollection = function(collection, callback) {
  db.collection(collection, function(error, c) {
    if(error || typeof callback != "function") return;
    callback(c);
  });
}

exports.eval = function(f, params, callback) {
  db.eval(f, params, function(error, data) {
    util.doCallback(callback, data);
  });
}


