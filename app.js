var io = require('socket.io')(process.env.PORT || 3000);
var shortid = require("shortid");
//mongodb+srv://djenetopulos:the squeezing bewilderment@dnj-cluster-oe9ho.gcp.mongodb.net/test?retryWrites=true&w=majority
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
        console.log('player shot time is: ', data.shotTime)
        socket.broadcast.emit('shotTime', data);
    });
    //  poop

    socket.on('disconnect',function(){
        console.log("player disconnected");
        players.splice(players.lastIndexOf(thisClientId), 1);
        socket.broadcast.emit('disconnected', {id:thisClientId});
    });
});