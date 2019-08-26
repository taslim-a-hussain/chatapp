const express = require('express');
const path    = require('path');
const http    = require('http');
const socketio = require('socket.io');
const Filter   = require('bad-words');
const { generateMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

// app
const app = express();

// Static Dir
const staticDir = path.join(__dirname, '../public');
app.use(express.static(staticDir));


// Server
const server = http.createServer(app);

// io
const io = socketio(server);

// On connection event
io.on('connection', (socket) => {
    console.log('New Websocket connection');


    socket.on('join', (data, callback) => {

        const { error, user } = addUser({id: socket.id, username: data.username, room: data.room});

        if (error) {
            return callback(error);
        }

        socket.join(user.room);
        socket.emit('message', generateMessage('Admin', 'Welcome!'));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    });

   
    socket.on('msg', (msg, callback) => {

        const user = getUser(socket.id);

        const filter = new Filter();
        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed!');
        }

       io.to(user.room).emit('message', generateMessage(user.username, msg));
       callback();
    });


    socket.on('sendLocation', (data, callback) => {

        const user = getUser(socket.id);

        io.to(user.room).emit('locationMessage', generateMessage(
            user.username,
            `https://www.google.com/maps?q=${data.latitude},${data.longitude}`
        ));
        callback();
    });


    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });

});

// export app
module.exports = server;