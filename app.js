var io = require('socket.io')(process.env.PORT || 3000);
var shortid = require("shortid");
var express = require("express");
var mongoose = require('mongoose');

//load model (Schema)
require('../Showdown Server/records');
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

    socket.broadcast.emit('nameSelf', {id:thisClientId});

    //  spawn all newly joined players
    //socket.broadcast.emit('spawn', {id:thisClientId});

    

    socket.on('ready', function(data){
        console.log('player ready');
        playerCount++;

        
        players.forEach(function(playerId){
            if(playerId == thisClientId){
                return;
            }
            socket.broadcast.emit('spawn', {id:playerId});
            console.log('spawning player of I=id: ', playerId);
        });


        //  start shooting between 3 and 7 seconds after more than one player is present
        //  if more players connect before the time is up, restart the timer
        if(playerCount >= 2)
        {
            console.log("two players present.  prepare to duel.")
            clearTimeout(timeToFire);
            var waitTimer = 3000 + (Math.random() * 4000);
            console.log("Draw in " + waitTimer + " ms.")
            timeToFire = setTimeout(function(){socket.emit('draw');}, waitTimer);
        }
    });
    
    socket.on('firedAt', function(){
        data.id = thisClientId;
        console.log('player shot was: ', playerId)
        socket.broadcast.emit('died', data);
    });

    socket.on('shotTime', function(data){
        console.log("made it here: " + data.id);
        data.id = thisClientId;
        console.log('player ' + data.id + ' shot time is: ', data.shotTime)
        reactions[players.lastIndexOf(data.id)] = data.shotTime;
        
        //record the player's time in the database
        var newTime = {
            id:data.id,
            user:data.username,
            time:data.shotTime
        }        
        new Time(newTime).save().then(function(){
            //Database stuff
            var TopRecords = []
            TopRecords.fill({
              id:"a",
               user:"Dev",
              time:2000
            });

            //Take in all the records
            Time.find().then(function(records){
                records.forEach(record => {
                    TopRecords.push(record);
                })
            })

            TopRecords.sort((a, b) => a.time < b.time)

            socket.broadcast.emit('DisplayHighScores', TopRecords.slice(0, 9));
        });

        var roundComplete = true;
        var fastestPlayer = 0;
        reactions.forEach(function(r){
            if(r < 0)
            {
                roundComplete = false;
                console.log("tested reactions but one reaction is negative (" + r + ") so we are not ready to proceed");
            }
            else
            {
                console.log(r + " seems fine to me");
                if(r < reactions[fastestPlayer])
                {
                    fastestPlayer = reactions.lastIndexOf(r);
                }
            }
        })
        //if(roundComplete && fastestPlayer)
        //socket.broadcast.emit('win', )
        //socket.broadcast.emit('shotTime', data);

    });

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