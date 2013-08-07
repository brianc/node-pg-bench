var pg = require('pg');
var async = require('async');

pg.connect(function(err, client, done) {
  if(err) throw err;
  var getAll = function(n, cb) {
    client.query('SELECT * FROM test_data', cb);
  };
  async.timesSeries(20, getAll, function(err) {
    if(err) throw err;
    var start = Date.now();
    client.query('SELECT * FROM test_data', function() {
      console.log('node',Date.now() - start, 'milliseconds');
      done();
      pg.end();
    });
  });
});
