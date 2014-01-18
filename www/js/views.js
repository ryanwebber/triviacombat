// @author Ryan Webber

/**
 * Takes data provided by the user to be converte into json data
 */
$.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        
        $.each(a, function() {
                        // ensure object has valid name
                if (o[this.name] !== undefined) 
                {
                        if (!o[this.name].push) 
                        {
                                o[this.name] = [o[this.name]]; // convert into object
                        } // end if
                        o[this.name].push(this.value || ''); // append value to end of array
                } // end if
                else 
                {
                        o[this.name] = this.value || ''; // set name of object
                } // end else
        }); 

        return o; // return object
};


/**
* Renders the Home screen
*/
var HomeView = Backbone.View.extend({
    render: function () {
        $.get('templates/home.html', function (incomingTemplate) {
            $('#page').html(Handlebars.compile(incomingTemplate)).trigger('create'); 
        });

        socket = io.connect('http://localhost:8001');

        return this;
    }
});