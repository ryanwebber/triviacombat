// set routing variables
var Router = Backbone.Router.extend({
	routes: {
        '': 'homePage',
        'nextQuestion': 'question'
	}
});


var app_router = new Router();

app_router.on('route:home', function() {
	home.render();
});

app_router.on('route:question', function() {
    home.render();
});