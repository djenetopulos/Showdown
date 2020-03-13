var io = require('socket.io')(process.env.PORT || 3000);
var shortid = require("shortid");
var express = require("express");
var mongoose = require('mongoose');

//load model (Schema)
require('../ShowdownServer/records');
var Time = mongoose.model('records');

//mongodb+srv://djenetopulos:the%20squeezing%20bewilderment@dnj-cluster-oe9ho.gcp.mongodb.net/test?retryWrites=true&w=majority
//connect  to mongoose
mongoose.connect("mongodb+srv://HapShapIncorporated:nitsujSHAPPY2298%40%40%28%2A@web-api-for-games-f34dp.mongodb.net/test?retryWrites=true&w=majority",{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(function(){
    console.log('mongodb connected');
}).catch(function(err){
    console.log(err);
});



console.log('Server has arrived');
var players = [];
var reactions = [];
var playerCount = 0;
var timeToFire;
io.on('connection', function(socket){
    console.log('client connected');
    
    var thisClientId = shortid.generate();
    players.push(thisClientId);
    reactions.push(-9999);

    socket.emit('nameSelf', {id:thisClientId});

    //  spawn all newly joined players
    //socket.broadcast.emit('spawn', {id:thisClientId});

    socket.on('spawnExisting', function(data){
        socket.broadcast.emit('spawn', {id:data.id,playerName:data.playerName});

        //  start shooting between 3 and 7 seconds after more than one player is present
        //  if more players connect before the time is up, restart the timer
        if(playerCount >= 2)
        {
            clearTimeout(timeToFire);
            var waitTimer = 3000 + (Math.random() * 4000);
            console.log("Draw in " + waitTimer + " ms.")
            timeToFire = setTimeout(function(){socket.broadcast.emit('draw');socket.emit('draw');}, waitTimer);

        }
    });

    socket.on('ready', function(data){
        console.log(thisClientId + ': ready');
        
        playerCount++;

        socket.broadcast.emit('spawn', {id:thisClientId,playerName:data.playerName})
        
        socket.broadcast.emit('requestSpawn');
    });
    
    socket.on('firedAt', function(){
        data.id = thisClientId;
        console.log('player shot was: ', playerId)
        socket.broadcast.emit('died', data);
    });

    socket.on('shotTime', function(data){
        //console.log(thisClientId + " : " + data.id);
        data.id = thisClientId;
        console.log('player ' + data.id + ', ' + data.playerName + ' shot time is: ', data.shotTime)
        reactions[players.lastIndexOf(data.id)] = data.shotTime;
        
        //console.log(thisClientId + ': ' + reactions);
               
        console.log(reactions);
        if(reactions.every(function(reaction){
            return reaction > 0;
        })) {
            console.log("looking for the winner");
            var fastestShotIndex = (reactions[0] > reactions[1]) ? 1 : 0;
            socket.emit('findWinner', {id:players[fastestShotIndex],shotTime:reactions[fastestShotIndex]});
            socket.broadcast.emit('findWinner', {id:players[fastestShotIndex],shotTime:reactions[fastestShotIndex]});
        }
        else
        {
            console.log('at least one time not in, no winner found');
        }

    });

    socket.on('winner', function(data) {
        console.log('winner found');

        //record the player's time in the database
        var newTime = {
            id:thisClientId,
            user:data.playerName,
            time:data.shotTime
        }
        console.log(newTime);
        new Time(newTime).save().then(function(){
            //Database stuff

            var TopRecords = []
            //Take in all the records
            Time.find().then(function(records){
                records.forEach(function(record, index){
                    TopRecords.push({
                        id:record.id,
                        user:record.user,
                        time:record.time
                    })
                })

                TopRecords.sort(function(a,b){return a.time-b.time;});

                socket.emit('displayHighScores', {"AllRecords":TopRecords.slice(0, 10)});
                socket.broadcast.emit('displayHighScores', {"AllRecords":TopRecords.slice(0, 10)});
            })
        })
    })

    /*socket.on('disconnect',function(){
        console.log("player: " + {thisClientId} + " disconnected");
        reactions.splice(players.lastIndexOf(thisClientId),1);
        players.splice(players.lastIndexOf(thisClientId), 1);
        playerCount--;
        if(playerCount <= 1)
            clearTimeout(timeToFire);
        //socket.broadcast.emit('disconnected', {id:thisClientId});
    });*/
});