module.exports = {
  mean: function(values) {
    var sum = values.reduce(function(accum, current) {
      return accum += current;
    });
    return sum / values.length;
  }
};
