var io = require('socket.io')(process.env.PORT || 3000);
var shortid = require("shortid");
var express = require("express");
//mongodb+srv://djenetopulos:the%20squeezing%20bewilderment@dnj-cluster-oe9ho.gcp.mongodb.net/test?retryWrites=true&w=majority
console.log('Server has arrived');
var players = [];
var reactions = [];
var playerCount = 0;
var timeToFire;
io.on('connection', function(socket){
    console.log('client connected');
    playerCount++;
    var thisClientId = shortid.generate();
    players.push(thisClientId);
    reactions.push(-9999);
    //  spawn all newly joined players
    socket.broadcast.emit('spawn', {id:thisClientId});

    //  request logged in player's position
    //  socket.broadcast.emit('requestPosition');

    players.forEach(function(playerId){
        if(playerId == thisClientId){
            return;
        }
        socket.emit('spawn', {id:playerId});
        console.log('spawning player of I=id: ', playerId);
    });

    socket.on('yolo', function(data){
        console.log('yolo\'d');
        console.log(data);
    });

    socket.on('firedAt', function(data){
        data.id = thisClientId;
        console.log('player shot was: ', playerId)
        socket.broadcast.emit('died', data);
    });

    socket.on('shotTime', function(data){
        data.id = thisClientId;
        console.log('player ' + data["id"] + ' shot time is: ', data.shotTime)
        reactions[players.lastIndexOf(data.id)] = data.shotTime;
        
        var roundComplete = true;
        var fastestPlayer = 0;
        foreach(r in reactions)
        {
            if(r < 0)
            {
                roundComplete = false;
                console.log("tested reactions but one reaction is negative (" + r + ") so we are not ready to proceed");
                break;
            }
            else
            {
                console.log(r + " seems fine to me");
                if(r < reactions[fastestPlayer])
                {
                    fastestPlayer = reactions.lastIndexOf(r);
                }
            }
        }
        //if(roundComplete && fastestPlayer)
        //socket.broadcast.emit('win', )
        //socket.broadcast.emit('shotTime', data);

    });

    socket.on('disconnect',function(){
        console.log("player disconnected");
        reactions.splice(players.lastIndexOf(thisClientId),1);
        players.splice(players.lastIndexOf(thisClientId), 1);
        playerCount--;
        if(playerCount <= 1)
            clearTimeout(timeToFire);
        socket.broadcast.emit('disconnected', {id:thisClientId});
    });

    //  start shooting between 3 and 7 seconds after more than one player is present
    //  if more players connect before the time is up, restart the timer
    if(playerCount >= 2)
    {
        console.log("two players present.  prepare to duel.")
        clearTimeout(timeToFire);
        var waitTimer = 3000 + (Math.random() * 4000);
        console.log("Draw in " + waitTimer + " ms.")
        timeToFire = setTimeout(function(){socket.broadcast.emit('draw');}, waitTimer);
    }
});
