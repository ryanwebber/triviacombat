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
    			console.log("Connection successful");
    		}else{
    			callbacks.error("Could not connect to server");
    		}
  		});
	};

	var start = function(user){
		socket.emit('joinGame',user.name);

		socket.on('connectStatus', function(data){
			if(data.success){
				if(data.waiting){
					callbacks.inLine();
				}
			}else{
				callbacks.error("Failed to wait in line");
			}
		});

		socket.on('gameStarted',function(data){
			callbacks.gameStarted(data);

			socket.on('newQuestion', function(data){
				canAnswer=true;
				callbacks.newQuestion(data);
				count++;
			});

			socket.on('questionResult', function(data){
				callbacks.questionResult(data);
			});

			socket.on('gameOver', function(data){
				state=2;
				callbacks.gameOver(data);
				socket.disconnect();
			});

		});

		state=1;

	}

	init();

	return {
		connect: function(data){
			if(state==0) {
				start(user);
			}
		}, getCurrentQuestion: function(){
			return count;
		}, readyUp: function(){
			if(state==1){
				socket.emit('readyUp',true);
			}
		}, answerQuestion: function(answer){
			if(state==1&&canAnswer){
				canAnswer=false;
				socket.emit('answerQuestion', answer);
			}
		}
	};

};



