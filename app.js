
/**
 * Module dependencies.
 * @Author Ryan Webber
 */

 var express = require('express');
 var path = require('path');
 var app = express();
 var http = require('http').createServer(app);
 var passport = require('passport');
 var LocalStrategy = require('passport-local').Strategy;
 var io = require('socket.io').listen(http);
 var mongoose = require('mongoose');
 var game = require('./lib/game.js');
 var user = require('./models/user.js');
 var passportSocketIo = require("passport.socketio");
 var mongoStore = require('connect-mongo')(express);
 var sessionStore = new mongoStore({
    db: 'triviadb'
 });

io.set('authorization', passportSocketIo.authorize({
	cookieParser: express.cookieParser,
  	secret: '9f9348c39cj4938cj334c',    
  	store: sessionStore,
  	passport: passport,
  	success: function(data, accept){
  		console.log("connection from: "+data.user.username);
  		//readyUser(data);
  		accept(null,true);
  	},
  	fail: function(data,message,error,accept){
  		console.log("Rejected connection: "+message);
  		data.emit({
  			success: false,
  			message: "Unauthorized Access"
  		});
  		accept(null,false);
  	}  
}));

app.configure(function(){
    app.set('port', process.env.PORT || 8002); // set port
    app.set('env', 'developement');
	app.use(express.favicon());
	app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('nd923898f19f478g87f43'));
    app.use(express.session({
    	secret: '9f9348c39cj4938cj334c',
    	store: sessionStore
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use('', express.static(__dirname + '/www'));
    app.use('/admin', express.static(__dirname + '/admin'));
});

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}


var waiter = null;

/*
* Get paths and suck=h
*/

// Set up passport settings
passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(function(user, done) {
  done(null, user._id); // store userid in session. access by req.user.userid
});

// returns raw user data
passport.deserializeUser(function(userid, done) {
	user.findUserById(userid,function(err,collection){
		done(null,collection[0]);
	});
});

io.sockets.on('connection', function (socket) {

	socket.emit('welcome', {
		message: "Please log in"
	});

	socket.on('disconnect', function(){
		console.log('disconnect');
		if(waiter!=null && waiter.socket==socket) socket=null;
	});

});


app.get('/status', function(req,res){
	res.send({
		success: true,
		status: "ready"
	});
});

app.get('/session', function(req,res){
	if(req.user){
		res.send({
			success: true,
			active: true
		});
	}else{
		res.send({
			success:true,
			active: false
		});
	}
});


app.post('/login', passport.authenticate('local'), function (req, res) {
	user.findUserByUsername(req.body.username, function (err, collection) {
		if(err){
			res.send({
				success:false,
				error:"invalidLogin"
			});
        }else{

        	var obj = {
   	    		_id:collection[0]._id,
                username: collection[0].username,
                level: collection[0].level,
                score: collection[0].score,
                profile: collection[0].profile,
                dateJoined: collection[0].dateJoined,
                gamesPlayed: collection[0].gamesPlayed,
                gamesWon: collection[0].gamesWon,
                questionsAnswered: collection[0].questionsAnswered,
                questionsCorrect: collection[0].questionsCorrect,
        	}

            res.send(obj);
        }
    });
});

app.get('/logout', function (req, res) {
	req.logout();
	res.send({
		success:true,
		active: false
	})
});

app.post('/register', function (req, res) {
	if(req) {
		if(!req.body.username || !req.body.password){
			res.send({
				error: "missingFields",
				success: false
			});
		}else{
			user.findUserByUsername(req.body.username, function (error, userCollection){
				if(userCollection.length === 0){
					user.register(new user({
						username : req.body.username,
					}), req.body.password, function (err, collection){
						if (err){
							res.send({
								"error":"unknownError",
								"success" : "false"
							});
						}else{

							res.send({
				   	    		_id:collection._id,
				                username: collection.username,
				                level: collection.level,
				                score: collection.score,
				                profile: collection.profile,
				                dateJoined: collection.dateJoined,
				                gamesPlayed: collection.gamesPlayed,
				                gamesWon: collection.gamesWon,
				                questionsAnswered: collection.questionsAnswered,
				                questionsCorrect: collection.questionsCorrect,
				        	});
						} // end else
					}); 
				} else{
					res.send({
						error:"usernameTaken",
						success: false
					}); 
				} 
			});
		}
	}
});


var readyUser = function(socket){

	socket.on('test', function(data){
		if(socket.handshake.user.logged_in){
			socket.emit('test',"logged in as: "+socket.handshake.user.username);
			console.log("Received test: "+socket.handshake.user.username);
		}else{
			socket.emit('test',"user not logged in");
			console.log("Received test: not logged in");
		}
		
	});

	socket.on('joinGame', function(data){

		if(!socket.handshake.user.logged_in) return;

		var user = socket.handshake.user;

		console.log("Starting game");

		var player = {
			socket: socket,
			user: {
				username: username,
				profile: user.profile,
				level: user.level,
				score: user.score,
				_id: user._id
			}
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
				opponent: player2.user
			});

			player2.socket.emit('connectStatus', {
				waiting: false,
				success: true,
				opponent: player.user
			})

			game.game(player,player2);

		}
	});
}

http.listen(app.get('port'));



