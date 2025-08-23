require('dotenv').config(); // ✅ Load env first

const express = require('express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// ✅ Declare after dotenv.config()
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

console.log('MONGO_URI:', MONGO_URI); // ✅ Debug line now works

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));


// ✅ Mongoose Schema
const messageSchema = new mongoose.Schema({
  name: String,
  message: String,
   socketId: String, 
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);


// ✅ Static files & routes
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


let socketConnected = new Set();

io.on('connection', (socket) => {
  console.log('A user connected');

  // Send previous messages
  Message.find().sort({ timestamp: 1 }).limit(50).then((messages) => {
    socket.emit('message-history', messages);
  });

  io.emit('clients-total', io.engine.clientsCount);

 socket.on('message', async (data) => {
  // Agar naam empty hai, message save na karo
  if (!data.name || data.name.trim() === '') {
    socket.emit('error-message', 'Please enter your name before sending a message.');
    return;
  }

  const newMessage = new Message({
    name: data.name,
    message: data.message,
    timestamp: data.timestamp || new Date(),
  });

  await newMessage.save();

  io.emit('message', { ...data, id: socket.id });
});


  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data);
  });

  socket.on('stopTyping', () => {
    socket.broadcast.emit('stopTyping');
  });

  socket.on('disconnect', () => {
    io.emit('clients-total', io.engine.clientsCount);
    console.log('A user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
