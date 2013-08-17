var current = require('pg');
var master = require('pg-master');
var assert = require('assert');
var async = require('async');
var stats = require('./stats');

var benchQuery = function(query, cb) {
  console.log('bench', query);
  var createTimingFunction = function(pg) {
    return function(n, cb) {
      pg.connect(function(err, client, done) {
        var time = process.hrtime();
        client.query(query, function(err, result) {
          var diff = process.hrtime(time);
          done();
          if(diff[0] > 0) {
            err = err || new Error("Run took more than 1 second.")
          }
          cb(err, diff[1]);
        });
      });
    };
  };

  var timeCurrent = createTimingFunction(current);
  var timeMaster = createTimingFunction(master);

  var runBench = function(action, n, cb) {
    async.timesSeries(20, action, function(err, res) {
      console.log('run complete, sleep a bit...');
      setTimeout(function() {
        cb(err, res);
      }, 500);
    });
  };


  var result = {
    query: query,
    current: null,
    master: null
  };
  console.log('run current');
  async.timesSeries(4, runBench.bind(runBench, timeCurrent), function(err, res) {
    if(err) return cb(err);
    for(var i = 0; i < res.length; i++) {
      console.log('run', i, 'mean:', stats.mean(res[i]))
    }
    result.current = res;
    console.log('run master');
    async.timesSeries(4, runBench.bind(runBench, timeMaster), function(err, res) {
      if(err) return cb(err);
      for(var i = 0; i < res.length; i++) {
        console.log('run', i, 'mean:', stats.mean(res[i]))
      }
      result.master = res;
      cb(null, result);
    });
  });
};

var report = function(res) {
  //remove first run bias
  res.current.shift();
  res.master.shift();
  var currentMeans = res.current.map(function(results) {
    return stats.mean(results);
  });
  var masterMeans = res.master.map(function(results) {
    return stats.mean(results);
  });
  var currentMean = stats.mean(currentMeans);
  var masterMean = stats.mean(masterMeans);
  var diff = currentMean/masterMean;
  var change = (100 - (diff*100));
  console.log(res.query, change + '%', (change > 0 ? "FASTER" : "SLOWER"));
};

var q = 'SELECT * FROM test_data';
var queries = [
  'SELECT * FROM test_data',
  'SELECT id FROM test_data',
  'SELECT * FROM test_data LIMIT 1'
];

async.mapSeries(queries, benchQuery, function(err, res) {
  if(err) throw err;
  res.forEach(report);
  current.end();
  master.end();
});
