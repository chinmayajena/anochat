var express = require('express');
var app = express();
var linkify = require('linkifyjs');
require('linkifyjs/plugins/hashtag')(linkify); // optional
var linkifyHtml = require('linkifyjs/html');

app.use(express.static(__dirname + '/public'));



var http = require('http').Server(app);
var io = require('socket.io')(http);


var users = [];
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    socket.emit('entrance', {
        message: 'Welcome to the chat room!'
    });
    socket.emit('entrance', {
        message: 'Your ID is #' + socket.id
    });


    socket.on('chat message', function(msg) {


        var linkifiedMsg = linkifyHtml(msg, {
            defaultProtocol: 'https'
        });
        io.emit('chat message', socket.nickname + " : " + linkifiedMsg);
    });


    socket.on('join', function(name) {
        console.log(name);
        users.push(name);
        socket.nickname = name;
        io.emit('chat message', 'Hello ' + name + '. Welcome to OpenBook. This is an <b>Anonymous Chat</b>! Be open to the world!')

        // attempt to clean up
        socket.once('disconnect', function() {
            var pos = users.indexOf(name);

            if (pos >= 0)
                users.splice(pos, 1);
        });


        io.emit('userlist', users);
    });


});

http.listen(3000, function() {
    console.log('listening on *:3000');
});