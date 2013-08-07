phony: simple

simple:
		@ruby simple.rb
		@node simple-connection.js
		@node simple.js
		@node simple-native.js
		@echo 'EXPLAIN ANALYSE SELECT * FROM test_data;' | psql
