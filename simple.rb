require 'pg'
pg = PGconn.open()

20.times do
  res = pg.exec "SELECT * FROM test_data"
  res.count
end

start = Time.now
res = pg.exec "SELECT * FROM test_data"
res.count
time = Time.now - start
puts "ruby #{time * 1000} milliseconds"
