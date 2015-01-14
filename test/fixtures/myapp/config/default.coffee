module.exports =
	# default configuration for app or module
	config:
		# database settings
		database:
			host: "dbhost"
			name: "dbtest"
			port: 1529
		# a test array
		array: [
			1
			"2"
			3.01
		]
	# module specifics for npm module "test"
	test:
		url: 'http://foo.bar/'
	# module specifics for a special version of module "test"
	'test@0.1.0':
		cors: false
	# common settings available to all modules
	common:
		value: "test"
