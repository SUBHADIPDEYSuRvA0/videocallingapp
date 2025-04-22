// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const session = require('express-session');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authroutes');
const roomRoutes = require('./routes/roomroutes');
const socketHandler = require('./socket/sockethendeler');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// DB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/auth', authRoutes);
app.use('/room', roomRoutes);

app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

// Socket
socketHandler(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
