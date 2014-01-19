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
			if(player2.isReady){
				next();
			}else{
				send(player1,'waitingForOther',true);
			}
		});

		listen(player2, 'playerReady',function(data){
			player2.isReady=true;
			if(player1.isReady){
				next();
			}else{
				send(player2,'waitingForOther',true);
			}
		});

	}

	var next = function(){
		if(current >= questions.length){
			end();
		}else{
			player1.answer = {answered:false};
			player2.answer = {answered:false};
			player1.isReady=false;
			player2.isReady=false;
			sendBoth('newQuestion', questions[current].question);

			listen(player1, 'answerQuestion', function(data){
				if(player1.answer.answered) return; // already guessed

				player1.answer.answered=true;
				player1.answer.answer=data;
				var answer = questions[current].answer;
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

				player2.answer.answered=true;
				player2.answer.answer=data;
				var answer = questions[current].answer;
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

			current += 1;
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