import express from 'express';
import http from 'http';
import socketIO from 'socket.io';

const server = http.createServer(app);

const app = express();

const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

const connections = {};
const users = [];

io.on('connection', (socket) => {
  console.log(`${socket.id} is connected`);
  socket.on('join', ({ roomId, userProfile }) => {
    console.log('roomid', roomId);
    const { displayName } = userProfile;
    console.log(`${displayName} is join to ${roomId}`);
    socket.join(roomId);
    if (!connections[roomId]) {
      connections[roomId] = new Set();
    }
    connections[roomId].add(displayName);
    console.log('현재 접속자', connections[roomId].size);
    console.log('connection ', connections);
    const userCount = connections[roomId].size;
    socket.to(roomId).emit('user.count.update', userCount);
    // socket.to(roomId).emit('updateUser', )
  });

  socket.on('game.ready', ({ roomId }) => {
    console.log('game is Ready');
    socket.to(roomId).emit('game.start');
  });

  socket.on('game.add.command', ({ roomId, message }) => {
    console.log('roomId', roomId);
    console.log('message', message);
    socket.to(roomId).emit('game.get.command', message);
  });

  socket.on('game.turn.over', ({ roomId, currentTurn }) => {
    console.log('roomId ', roomId);
    console.log('turn over');
    socket.to(roomId).emit('game.turn.start', currentTurn);
  });

  socket.on('game.exit', ({ roomId, userProfile }) => {
    console.log('roomId', roomId);
    const { displayName } = userProfile;
    connections[roomId].delete(displayName);
    console.log('현재 접속자', connections[roomId].length);
    if (connections[roomId].length === 0) {
      delete connections[roomId];
    }
    console.log(connections);
    socket.disconnect();
  });
});

server.listen(5000, () => {
  console.log('listen on port 5000');
});
