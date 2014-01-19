// our game controller

var game = function(handler) {
	var socket = io.connect('http://localhost:8001');
	var callbacks = handler; // data handlers
	var state=0;
	var count = 0;
	var canAnswer = false;

	var init = function(){
		socket.on('welcome', function (data) {
    		if(data.success){
    			console.log("1. Welcome received");
    		}else{
    			console.log("Connection failed");
    			callbacks.error("Could not connect to server");
    		}
  		});
	};

	var start = function(user){

		socket.emit('joinGame',user.name);

		socket.on('connectStatus', function(data){
			console.log("2. Initializing game");
			if(data.success){
				if(data.waiting){
					callbacks.inLine();
				}
			}else{
				callbacks.error("Failed to wait in line");
			}
		});

		socket.on('gameStarted',function(data){
			console.log("3. Game started");
			callbacks.gameStarted(data);

			socket.on('waitingForOther', function(data){
				console.log("3.5. Waiting for other");
				callbacks.waitingForOther();
			});

			socket.on('newQuestion', function(data){
				console.log("4. New question");
				canAnswer=true;
				callbacks.newQuestion(data);
				count++;
			});

			socket.on('questionResult', function(data){
				console.log("5. Question result");
				callbacks.questionResult(data);
			});

			socket.on('gameOver', function(data){
				console.log("6. Game over");
				state=2;
				callbacks.gameOver(data);
				socket.disconnect();
			});

		});

		state=1;

	}

	init();

	return {
		connect: function(user){
			if(state==0) {
				start(user);
			}
		}, getCurrentQuestion: function(){
			return count;
		}, readyUp: function(){
			if(state==1){
				socket.emit('playerReady',true);
				console.log("Readying");
			}
		}, answerQuestion: function(answer){
			if(state==1&&canAnswer){
				canAnswer=false;
				socket.emit('answerQuestion', answer);
			}
		}
	};

};



