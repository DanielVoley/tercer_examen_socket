const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

// Manejo de conexiones de sockets
io.on('connection', (socket) => {
  console.log('Usuario conectado');

  // Escucha el evento de dibujo
  socket.on('drawing', (data) => {
    io.emit('drawing', data);
  });

  // Escucha el evento de mensajes de chat
  socket.on('chatMessage', (message) => {
    io.emit('chatMessage', message);
  });

  // Manejo de desconexiones de sockets
  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});
