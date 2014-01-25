var express = require('express');
var mongoose = require('mongoose');
var db = require('../lib/db.js');
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new db.Schema({
    score: {type: Number, default: 0},
    profile: {type: String, default: "defaults/profile.jpg"},
    dateJoined: {type: Date, default: Date.now},
    gamesPlayed: {type: Number, default: 0},
    gamesWon: {type: Number, default: 0},
    questionsAnswered: {type: Number, default: 0},
    questionsCorrect: {type: Number, default: 0} 
});

UserSchema.plugin(passportLocalMongoose);

var MyUser = db.mongoose.model('user', UserSchema,'user');

var findUserById = function(id, callback){
    MyUser.find({_id:id},function(err, collection){
        callback(err, collection);
    });
}

var findUserByUsername = function(username, callback){
    MyUser.find({username:username}, function(err, collection){ 
        callback(err, collection);
    });
}

var updateStats = function(_id, questions, correct, score, state, callback){
    MyUser.findByIdAndUpdate(_id,{
        $inc: {
            gamesPlayed: 1,
            gamesWon: (state>=0)?1:0,
            questionsAnswered: questions,
            questionsCorrect: correct,
            score: score
        }
    }, function(err, collection){
        callback(err, collection);
    });
}

module.exports = MyUser;
module.exports.findUserByUsername=findUserByUsername;
module.exports.findUserById=findUserById;
