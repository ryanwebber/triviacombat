var questions = [{
	question: "There is 12 in a dozen",
	answer: true
},{
	question: "There are 6 days in a week",
	answer: false
},{
	question: "The right of the ship is port",
	answer: false
}];

var game = function(a,b){
	var player1 = a;
	var player2 = b;
	var current = 0;
	var answer;
	var gameTimer = null;

	var sendBoth = function(tag, data){
		player1.socket.emit(tag,data);
		player2.socket.emit(tag,data);
	}

	var send = function(player, tag, data){
		player.socket.emit(tag,data);
	}

	var listen = function(player, tag, callback){
		player.socket.on(tag, callback);
	}

	var clean = function(player){
		player.socket.removeAllListeners('playerReady');
		player.socket.removeAllListeners('answerQuestion');
	}

	var runCountdown = function(call){
		var count = 15;
		var callback = call;
		var timer = setInterval(function() {
			sendBoth('gameTimer', {
				time: count
			});
			if(count <= 0) {
				killLoop();
			}else{
				count --;
			}
   		}, 1000);

   		var killLoop = function(){
   			clearInterval(timer);
   			callback();
   		}

		return {
			kill: function(){
				clearInterval(timer);
				callback();
				return null;
			}, 
		};
	}

	var init = function(){

		player1.score = 0;
		player2.score = 0;

		send(player1, 'gameStarted',{
			opponent: player2.name,
			needReady: true,
			numQuestions: questions.length
		});

		send(player2, 'gameStarted',{
			opponent: player1.name,
			needReady: true,
			numQuestions: questions.length
		});

		listen(player1, 'playerReady',function(data){
			player1.isReady=true;
			if(player2.isReady && gameTimer!=null){
				gameTimer.kill();
			}else{
				send(player1,'waitingForOther',true);
			}
		});

		listen(player2, 'playerReady',function(data){
			player2.isReady=true;
			if(player1.isReady && gameTimer!=null){
				gameTimer.kill();
			}else{
				send(player2,'waitingForOther',true);
			}
		});

		gameTimer = runCountdown(function(){
			console.log("Callback --------------");
			next();
		});

	}

	var next = function(){
		player1.answer = {answered:false};
		player2.answer = {answered:false};
		player1.isReady=false;
		player2.isReady=false;
		sendBoth('newQuestion', questions[current].question);

		listen(player1, 'answerQuestion', function(data){
			if(player1.answer.answered) return; // already guessed
			if(player2.answer.answered && gameTimer!=null) gameTimer = gameTimer.kill(); 

			console.log(data);
			player1.answer.answered=true;
			player1.answer.answer=data;
			var score=0;
			var correct=false;
			if(player1.answer.answer==answer){
				correct = true;
				score = player2.answer.answered && player2.answer.answer==answer? 1:2;
			}
			player1.score+=score;
			send(player1, 'questionResult', {
				correct: correct,
				points: score,
				total: player1.score,
				needReady: true
			});
		});

		listen(player2, 'answerQuestion', function(data){
			if(player2.answer.answered) return; // already guessed
			if(player2.answer.answered && gameTimer!=null) gameTimer = gameTimer.kill(); 
			console.log(data);

			player2.answer.answered=true;
			player2.answer.answer=data;
			var score=0;
			var correct=false;
			if(player2.answer.answer==answer){
				correct = true;
				score = player1.answer.answered && player1.answer.answer==answer? 1:2;
			}
			player2.score+=score;
			send(player2, 'questionResult', {
				correct: correct,
				points: score,
				total: player2.score,
				needReady: true
			});
		});

		answer = questions[current].question;
		current++;

		gameTimer = runCountdown(function(){
			console.log("Callback --------------");
			endRound();
		});

	}

	var endRound = function(){
		if(!player1.answer.answered){
			send(player1, 'questionResult', {
				correct: false,
				points: 0,
				total: player1.score,
				needReady: true
			});
		}

		if(!player2.answer.answered){
			send(player2, 'questionResult', {
				correct: false,
				points: 0,
				total: player2.score,
				needReady: true
			});
		}

		if(current>=questions.length){
			end();
		}else{
			player1.isReady=false;
			player2.isReady=false;
			player1.answer={answered: false};
			player2.answer={answered: false};

			gameTimer=runCountdown(function(){
				console.log("Callback --------------");
				next();
			});

		}

	}

	var end = function(){
		var state = 0;
		if(player1.score>player2.score) state = 1;
		else if (player1<player2.score) state = -1;
		send(player1, 'gameOver', {
			score: player1.score,
			winner: state // -1=loss , 0=tie, 1=win
		});
		send(player2, 'gameOver', {
			score: player2.score,
			winner: -state // -1=loss , 0=tie, 1=win
		});

		clean(player1);
		clean(player2);

	}

	init();

}

module.exports.game=game;