const express = require('express')
const app = express()
const http = require('http').createServer(app)

const PORT = process.env.PORT || 3000

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

app.use(express.static(__dirname+ '/public'))

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/index.html')
})

//SOCKET

const io = require('socket.io')(http)

let rooms = {};

io.on('connection', (socket) => {
    console.log('connected...')

    socket.on('join-room', ({ room, Name }) => {
        socket.join(room);
        socket.room = room;
        socket.username = Name;
        if (!rooms[room]) rooms[room] = [];
        // Prevent duplicate users in the room
        if (!rooms[room].includes(Name)) rooms[room].push(Name);
        io.to(room).emit('users-list', rooms[room]);
    });

    socket.on('disconnect', () => {
        const room = socket.room;
        if (room && rooms[room]) {
            rooms[room] = rooms[room].filter(u => u !== socket.username);
            io.to(room).emit('users-list', rooms[room]);
            if (rooms[room].length === 0) delete rooms[room];
        }
    });

    socket.on('message', (msg) => {
        // Only emit to others in the room, not to the sender
        if (msg.room) {
            socket.to(msg.room).emit('message', msg);
        }
    });

    socket.on('typing', (user) => {
        const room = socket.room;
        if (room) socket.to(room).emit('typing', user);
    });
    socket.on('stop-typing', (user) => {
        const room = socket.room;
        if (room) socket.to(room).emit('stop-typing', user);
    });
})