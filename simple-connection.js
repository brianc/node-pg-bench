var Connection = require('pg').Connection;
var async = require('async');
var ok = require('okay');
var con = new Connection({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSERNAME
});
var host = process.env.PGHOST;
var port = process.env.PGPORT || 5432;

con.connect(port, host);
con.once('connect', function() {
  con.startup({
    user: process.env.PGUSERNAME || process.env.USER || 'postgres',
    password: process.env.PGPASSWORD
  });
  con.once('readyForQuery', function() {
    go(con);
  })
});

var go = function(con) {
  var run = function(n, cb) {
    con.query('SELECT * FROM test_data');
    con.once('readyForQuery', cb);
  };
  async.timesSeries(20, run, function() {
    var start = Date.now();
    run(1, function() {
      console.log('node connection', Date.now() - start);
      con.end();
    });
  });
};
