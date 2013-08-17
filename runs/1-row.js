module.exports = function(client, cb) {
  client.query('SELECT * FROM test_data', function(err, res) {
    cb(err);
  });
};
