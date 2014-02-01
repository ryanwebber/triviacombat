// @author Ryan Webber

var currentuser = null;
var active=null;
var socket = null;

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
        console.log(err);
		// display error
	}, inLine: function(){
		// show in line page
		app_router.navigate('#inLine', {trigger: true});

	},waitingForOther: function(){

		// waiting for other player
		app_router.navigate('#waiting', {trigger: true});

	},gameStarted: function(){
		// notifying the game is started

		app_router.navigate('#readyUp', {trigger: true});

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
		$("#timer").val(time).trigger('change');
	}
};



/**
* Renders the Home screen
*/
var HomeView = Backbone.View.extend({
	el: "#page",
    events: {
        "click #startgame": "startGame",
    },
    render: function () {
        $.get('templates/home.html', function (incomingTemplate) {
            $('#page').html(Handlebars.compile(incomingTemplate)).trigger('create'); 
            $('#homePage').addClass('animated bounceInUp');
        });

        return this;
    },
    startGame: function(event){
    	event.preventDefault();
    	active = game(socket, controller);
        active.connect();
    }
});

var LoginView = Backbone.View.extend({
    active: 0,
    el: "#page",
    events: {
        "click #signIn": "showSignin",
        "click #forget": "showForget",
        "click #register": "showRegister",
        "submit #login_form": "loginVerify"
    },
    render: function () {
        $.get('templates/login.html', function (incomingTemplate) {
            $('#page').html(Handlebars.compile(incomingTemplate)).trigger('create'); 
        });
        return this;
    }, hideAll: function(callback){
        switch(this.active){
            case 0:
                $('#login_access').attr('class','animated fadeOut');
                $("#login_access").one('webkitAnimationEnd mozAnimationEnd oAnimationEnd animationEnd', function(){
                    $("#login_access").hide();
                    callback();
                });
                break;
            case 1:
                $('#arrow').removeClass('col-xs-offset-4');
                $('#forget_access').attr('class','animated fadeOut');
                $("#forget_access").one('webkitAnimationEnd mozAnimationEnd oAnimationEnd animationEnd', function(){
                    $("#forget_access").hide();
                    callback();
                });
                break;
            case 2:
                $('#arrow').removeClass('col-xs-offset-8');
                $('#register_access').attr('class','animated fadeOut');
                $("#register_access").one('webkitAnimationEnd mozAnimationEnd oAnimationEnd animationEnd', function(){
                    $("#register_access").hide();
                    callback();
                });
                break;
        }
    }, showSignin: function(){
        if(this.active==0) return;
        else{
            this.hideAll(function(){
                $("#login_access").show();
                $('#login_access').attr('class','animated fadeIn');
            });
        }
        this.active=0;
    }, showForget: function(){
        if(this.active==1) return;
        else{
            $('#arrow').addClass('col-xs-offset-4');
            this.hideAll(function(){
                $("#forget_access").show();
                $('#forget_access').attr('class','animated fadeIn');
            });
        }
        this.active=1;
    }, showRegister: function(){
        if(this.active==2) return;
        else{
            $('#arrow').addClass('col-xs-offset-8');
            this.hideAll(function(){
                $("#register_access").show();
                $('#register_access').attr('class','animated fadeIn');
            });
        }
        this.active=2;
    }, loginVerify: function (ev) {
        ev.preventDefault();
        var userDetails = $(ev.currentTarget).serializeObject();
        var user = new LogInUser();

        //$('#loadingModal').modal('show');

        /********** Attempt to login the user **********/
        user.save(userDetails, {
            success: function (user) {
                console.log("user in");
                var userObject = user.attributes;
                //Successfully logged in
                if (userObject !== undefined){
                    /* Set users data */
                    currentuser = userObject;

                    $('#loginPage').addClass('animated bounceOutDown');
                    $('#loginPage').one('webkitAnimationEnd mozAnimationEnd oAnimationEnd animationEnd', function(){
                        socket = io.connect();
                        app_router.navigate('#/home', { trigger: true });
                    });
                    

                }
            },
            error: function () {
                
                //Wobble/shake form to indicate failed login
                $('#login_form').addClass('animated shake');
                $('#login_form').one('webkitAnimationEnd mozAnimationEnd oAnimationEnd animationEnd', function(){
                         //clear password box
                        $('#inputPassword').val('');
                        $('#login_form').removeClass('animated shake');
                });
            }
        });
    }, 
});


var InLineView = Backbone.View.extend({
    el: "#page",
    events: {
        "click #back": "back"
    },
    render: function () {
        $.get('templates/waiting.html', function (incomingTemplate) {
            $('#page').html(Handlebars.compile(incomingTemplate)).trigger('create'); 
        });
        return this;
    }, back: function(){
        active.quit();
        app_router.navigate("#/home", {trigger: true});
    }
});

var ReadyView = Backbone.View.extend({
	el: "#page",
    events: {
        "click #ready": "readyUp",
    },
    render: function () {
        $.get('templates/ready.html', function (incomingTemplate) {
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


