const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();
const port = 3000;
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const corsOptions ={
  origin:'*', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}

app.use(cors(corsOptions));

// app.get('/', (req, res) => {
// res.sendFile(__dirname + '/index.html')
// });


io.on('connection', (socket) => {
console.log('a user connected');
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});


io.on('deconnection', (socket) => {
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Connexion à la base de données MongoDB
mongoose.connect('mongodb://localhost:27017/Ares', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// io.on('connection', (socket) => {
//   console.log('a user connected');
//   socket.emit('connect', {message: 'a new client connected'});

//     socket.on('chat message', (msg) => {
//       io.emit('chat message', msg);
//     });
//   });


// io.on('deconnection', (socket) => {
    
//     socket.on('disconnect', () => {
//       console.log('user disconnected');
//     });
//   });



// Schéma du modèle d'utilisateur
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});





// Modèle d'utilisateur
const User = mongoose.model('User', userSchema);

// Middleware pour le parsing des données JSON
app.use(express.json());

// Endpoint pour l'inscription
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
    console.log(username);
  // Vérifier si l'utilisateur existe déjà
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  // Hachage du mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Création d'un nouvel utilisateur
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();

  res.status(201).json({ message: 'User created successfully' });
});

// Endpoint pour l'authentification
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Vérifier si l'utilisateur existe
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Vérifier le mot de passe
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  res.json({ message: 'Login successful' });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
