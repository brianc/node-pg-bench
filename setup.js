var ok = require('okay');
var async = require('async');
var pg = require('pg');
var randomstring = require('randomstring').generate.bind(require('randomstring'));

pg.connect(ok(function(client, done) {
  client.query('DROP TABLE IF EXISTS test_data');
  client.query('CREATE TABLE IF NOT EXISTS test_data(id SERIAL PRIMARY KEY, name TEXT, row_num int4)');
  var insert = function(n, cb) {
    var q = client.query('INSERT INTO test_data(name, row_num) VALUES ($1, $2)', [randomstring(), n], cb);
    q.on('end', function() {
      console.log('inserted row',n);
    });
  }
  async.times(10000, insert, function() {
    console.log('inserted 1000 rows into test_data');
    done();
    pg.end();
  });
}));
