import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hackathon', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the Profile schema
const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  tags: { type: [String], required: true }, // Array of strings for tags
  LinkedInURL: { type: String, required: false }, // LinkedIn URL
});

// Create the Profile model
const Profile = mongoose.model('Profile', profileSchema);

// API endpoint to get all profiles
app.get('/api/profiles', async (req, res) => {
  try {
    const profiles = await Profile.find();
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define the Hackathon schema
const hackathonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true }, // Single date for simplicity, can be adjusted
  location: { type: String, required: true },
});

// Create the Hackathon model
const Hackathon = mongoose.model('Hackathon', hackathonSchema);

// API endpoint to get all hackathons
app.get('/api/hackathons', async (req, res) => {
  try {
    const hackathons = await Hackathon.find();
    res.json(hackathons);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define the User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store plain text password (not recommended for production)
});

// Create the User model
const User = mongoose.model('User', userSchema);

// API endpoint for user signup
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error during signup:', error); // Log error for debugging
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// API endpoint for user login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('a user connected');

  // Listen for incoming messages
  socket.on('message', (msg) => {
    console.log('message received:', msg);
    // Broadcast the message to all connected clients
    io.emit('message', msg);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Start the server
server.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
