const path = require('path');
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
require("dotenv").config();

const Experiment = require('./models/Experiment');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Create Socket.IO server and enable CORS for development clients
const io = new Server(server, {
  cors: {
    origin: "*", // later restrict to frontend URL
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log('socket connected:', socket.id);

  socket.on("load_experiments", async () => {
    const data = await Experiment.find();
    socket.emit("experiments_data", data);
  });

  socket.on("create_experiment", async (exp) => {
    const newExp = await Experiment.create(exp);
    io.emit("experiment_created", newExp);
  });

  socket.on("update_experiment", async (exp) => {
    const updated = await Experiment.findByIdAndUpdate(
      exp._id,
      exp,
      { new: true }
    );
    io.emit("experiment_updated", updated);
  });

  // 🔥 Live notes (collaborative)
  socket.on("add_note", async ({ id, note }) => {
    const exp = await Experiment.findById(id);
    exp.notes.push({ text: note, timestamp: new Date() });
    await exp.save();

    io.emit("experiment_updated", exp);
  });

});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

// Connect to MongoDB if MONGODB_URI is set. If not set, we warn but still allow
// the server to run (useful for frontend-only testing).
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (MONGODB_URI) {
  mongoose.connect("mongodb+srv://ibalicoul246_db_user:v7U9wj9LssmaTOAe@cluster0-1.uw5pmza.mongodb.net/?appName=Cluster0-1", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(err));
} else {
  console.warn('MONGODB_URI not set — MongoDB not connected. Set MONGODB_URI to enable DB operations.');
}