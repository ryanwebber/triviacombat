// @author Ryan Webber


var active=null;

/**
 * Takes data provided by the user to be converte into json data
 */
$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
        
    $.each(a, function() {
                        // ensure object has valid name
        if (o[this.name] !== undefined) {
            if (!o[this.name].push){
                o[this.name] = [o[this.name]]; // convert into object
            } // end if
             o[this.name].push(this.value || ''); // append value to end of array
        }else{
            o[this.name] = this.value || ''; // set name of object
        } // end else
    }); 

    return o; // return object
};



var controller = {
	error: function(err){
		// show error page
		// display error
	}, inLine: function(){
		// show in line page

		app_router.navigate('#inLine', {trigger: true});

	},waitingForOther: function(){

		// waiting for other player
		app_router.navigate('#waiting', {trigger: true});

	},gameStarted: function(){
		// notifying the game is started

		app_router.navigate('#gameStarted', {trigger: true});

	}, newQuestion: function(ques){
		// show the question page
		question.currentQuestion=ques;
		app_router.navigate('#nextQuestion', {trigger: true});

	}, questionResult: function(questionResult){
		// show the question result page
		result.currentResult=questionResult;
		app_router.navigate('#questionResult', {trigger: true});

	}, gameOver: function(result){
		// show game over page, destroy object
		active = null;
	}, timeTrigger: function(time){
		$(".time").html(time);
	}
};



/**
* Renders the Home screen
*/
var HomeView = Backbone.View.extend({
	el: "#page",
    events: {
        "submit #nameform": "startGame",
    },
    render: function () {
        $.get('templates/home.html', function (incomingTemplate) {
            $('#page').html(Handlebars.compile(incomingTemplate)).trigger('create'); 
        });

        active = game(controller);

        return this;
    },
    startGame: function(event){
    	event.preventDefault();
    	active.connect({
    		name: $("#name").val()
    	});
    }
});


var InLineView = Backbone.View.extend({
    render: function () {
        $.get('templates/waiting.html', function (incomingTemplate) {
            $('#page').html(Handlebars.compile(incomingTemplate)).trigger('create'); 
        });
        return this;
    }
});

var StartView = Backbone.View.extend({
	el: "#page",
    events: {
        "click #startready": "readyUp",
    },
    render: function () {
        $.get('templates/started.html', function (incomingTemplate) {
            $('#page').html(Handlebars.compile(incomingTemplate)).trigger('create'); 
        });

        return this;
    },
    readyUp: function(event){
    	active.readyUp();
    }
});

var QuestionView = Backbone.View.extend({
	el: "#page",
    events: {
        "submit #answerform": "answerQuestion",
    },
    render: function (question) {
    	var q = this.currentQuestion;
        $.get('templates/question.html', function (incomingTemplate) {
            $('#page').html(Handlebars.compile(incomingTemplate)({
            	question: q
            })).trigger('create'); 
        });

        return this;
    },
    answerQuestion: function(event){
    	event.preventDefault();
    	var answer= $("#answer").is(':checked');
    	active.answerQuestion(answer);
    },
    currentQuestion: ""
});

var WaitingView = Backbone.View.extend({
    render: function (question) {
        $.get('templates/waiting2.html', function (incomingTemplate) {
            $('#page').html(Handlebars.compile(incomingTemplate)).trigger('create'); 
        });

        return this;
    },
});

var ResultView = Backbone.View.extend({
	el: "#page",
    events: {
        "click #resultready": "readyUp",
    },
    render: function (question) {
    	var res = this.currentResult;
        $.get('templates/result.html', function (incomingTemplate) {
            $('#page').html(Handlebars.compile(incomingTemplate)(res)).trigger('create'); 
        });

        return this;
    },
    readyUp: function(event){
    	active.readyUp();
    }, 
    currentResult: {}
});

var FinishView = Backbone.View.extend({
    render: function (question) {
        $.get('templates/finish.html', function (incomingTemplate) {
            $('#page').html(Handlebars.compile(incomingTemplate)).trigger('create'); 
        });

        return this;
    }
});


