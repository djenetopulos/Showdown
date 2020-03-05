var io = require('socket.io')(process.env.PORT || 3000);
var shortid = require("shortid");

console.log('Server has arrived');
var players = [];

io.on('connection', function(socket){
    console.log('client connected');
    
    var thisClientId = shortid.generate();
    players.push(thisClientId);
    
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
        console.log('You only yolo yolo');
        console.log(data);
    });

    socket.on('updatePosition', function(data){
        data.id = thisClientId;
        socket.broadcast.emit('updatePosition', data);
    });

    socket.on('move', function(data){
        data.id = thisClientId;
        console.log("player is moving", JSON.stringify(data));
        socket.broadcast.emit('move', data);
    });

    socket.on('disconnect',function(){
        console.log("player disconnected");
        players.splice(players.lastIndexOf(thisClientId), 1);
        socket.broadcast.emit('disconnected', {id:thisClientId});
    });
});