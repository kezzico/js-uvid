var assert = require('assert');
var db = require('../database.js');
var library = require('../domain/library.js');

module.exports = {
  'should connect to database': function(beforeExit) {
    db.connect('localhost', 27017, 'uvidTest', function(didConnect) {
      beforeExit(function() {
        assert.eql(didConnect, true);
      });    
    });
  },
    
  'should insert folder into library': function(beforeExit) {
    library.addFolder('root', 0, function(id) {
      beforeExit(function() {
        assert.isNotNull(id);
      });
    });
  },
  
  'should read folder contents': function(beforeExit) {
    library.getFolderContents(1, function(list) {
      beforeExit(function() {
        assert.isNotNull(list);
      });
    });
  },
  
  'should remove item from library': function(beforeExit) {
    library.removeItem(1, function(error) {
      beforeExit(function() {
        assert.isNull(error);
      });
    });
  }
}
