var Client = require('pg').Client;
var pgMaster = require('pg-master');
var async = require('async');

var SMALL_QUERY = 'SELECT * FROM test_data';
if(process.argv[2]) {
  SMALL_QUERY += ' LIMIT ' + process.argv[2]
}

var go = function(Client, x, cb) {
  var client = new Client();
  client.connect(function() {
    var time = process.hrtime();
    client.query(SMALL_QUERY, function(err) {
      var diff = process.hrtime(time);
      if(err) throw err;
      client.end()
      var mills = diff[1]
      cb(err, mills);
    });
  });
};

var run = function(Client, x, cb) {
};

var average = function(vals) {
  var total = 0;
  for(var i = 0; i < vals.length; i++) {
    total += vals[i]
  }
  return total/vals.length;
};

async.timesSeries(20, go.bind(go, Client), function(err, newRes) {
  if(err) throw err;
  async.timesSeries(20, go.bind(go, pgMaster.Client), function(err, oldRes) {
    if(err) throw err;
    console.log(SMALL_QUERY + ' new ', average(newRes));
    console.log(SMALL_QUERY + ' old ', average(oldRes));
  });
});
