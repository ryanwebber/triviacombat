// our game controller

var game = function(sk, handler) {
	if(sk==null) handler.error("No Socket");
	var socket = sk;
	var callbacks = handler; // data handlers
	var state=0;
	var count = 0;
	var canAnswer = false;

	var init = function(){
    	console.log("1. Joining Game");
	};

	var start = function(){

		socket.emit('joinGame',{});

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

			socket.on('gameTimer', function(data){
				callbacks.timeTrigger(data.time);
			});

			socket.on('gameOver', function(data){
				console.log("6. Game over");
				state=2;
				callbacks.gameOver(data);
				socket.removeAllListeners('gameOver');
				socket.removeAllListeners('gameTimer');
				socket.removeAllListeners('newQuestion');
				socket.removeAllListeners('questionResult');
				socket.removeAllListeners('waitingForOther');
				socket.removeAllListeners('gameStarted');
				socket.removeAllListeners('connectStatus');
			});

		});

		state=1;

	}

	init();

	return {
		connect: function(){
			if(state==0) {
				start();
			}
		}, getCurrentQuestion: function(){
			return count;
		}, readyUp: function(){
			if(state==1){
				socket.emit('playerReady',true);
			}
		}, answerQuestion: function(answer){
			if(state==1&&canAnswer){
				canAnswer=false;
				socket.emit('answerQuestion', answer);
			}
		}, quit: function(){
			state=2;
			socket.removeAllListeners('gameOver');
			socket.removeAllListeners('gameTimer');
			socket.removeAllListeners('newQuestion');
			socket.removeAllListeners('questionResult');
			socket.removeAllListeners('waitingForOther');
			socket.removeAllListeners('gameStarted');
			socket.removeAllListeners('connectStatus');
			socket.emit("quit");
		}
	};

};



