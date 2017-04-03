var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 9000

app.get('/', function(req, res) {
	// res.render('../dist/index.html');
	res.send('hello')
});

io.on('connection', function(socket) {
	console.log('connection detected')
	socket.on('disconnect', function() {
		console.log('connection lost')
	})
});

server.listen(port);

