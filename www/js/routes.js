// set routing variables
var Router = Backbone.Router.extend({
	routes: {
        '': 'login',
        'home' : 'home',
        'inLine': 'line',
        'readyUp': 'readyUp',
        'nextQuestion': 'question',
        'questionResult': 'questionResult',
        'gameOver': "over",
        'waiting':'waiting'

	}
});


var app_router = new Router();

app_router.on('route:home', function() {
	home.render();
});

app_router.on('route:line', function() {
    line.render();
});

app_router.on('route:readyUp', function() {
    ready.render();
});

app_router.on('route:question', function() {
    question.render();
});

app_router.on('route:questionResult', function() {
    result.render();
});

app_router.on('route:over', function() {
    finish.render();
});

app_router.on('route:waiting', function() {
    waiting.render();
});

app_router.on('route:login', function() {
    login.render();
});