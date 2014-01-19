
/**
 * Module dependencies.
 * @Author Ryan Webber
 */

 var express = require('express');
 var path = require('path');
 var app = express();
 var http = require('http').createServer(app);
 var io = require('socket.io').listen(http);
 var game = require('./lib/game.js');

// all environments
app.set('env', 'developement');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.set('port', process.env.PORT || 8001); // set port
app.use(app.router);
app.use(express.static(path.join(__dirname, 'www')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}


var waiter = null;

/*
* On connect, add user to wait list or connect them with the waiter
*/

io.sockets.on('connection', function (socket) {

	socket.on('disconnect', function(){
		console.log('disconnect');
		if(waiter!=null && waiter.socket==socket) socket=null;
	});

	socket.on('joinGame', function(data){
		var player = {
			socket: socket,
			name: data
		};

		if(waiter==null){
			waiter = player;
			socket.emit('connectStatus', {
				waiting: true,
				success: true
			});
		}else{
			var player2 = waiter;
			waiter = null;

			player.socket.emit('connectStatus', {
				waiting: false,
				success: true,
				opponent: player2.name
			});

			player2.socket.emit('connectStatus', {
				waiting: false,
				success: true,
				opponent: player.name
			})

			game.game(player,player2);

		}
	});

	socket.emit('welcome', {
		success: true,
		message: 'Send username to join'
	})

});

http.listen(app.get('port'));


