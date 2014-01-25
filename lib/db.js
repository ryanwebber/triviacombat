var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports.mongoose = mongoose;
module.exports.Schema = Schema;



// Connect to mongo
function connect() {
    var url = 'mongodb://localhost:27017/triviadb';
    mongoose.connect(url);
    console.log("Connected to Trivia database...");
}

function disconnect() {
    mongoose.disconnect();
    console.log("Disconnected from Trivia database ...");
}

connect();