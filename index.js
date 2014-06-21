var sys = require('sys'),
	express = require('express'),
	monitor = require('./monitor'),
	app = express(),
	server = app.listen(8888);

monitor.setServer(server);
app.use(express.vhost('127.0.0.1', monitor.app));
console.log('Listening');
