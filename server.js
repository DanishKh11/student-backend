// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Student = require('./models/Student');
require('dotenv').config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// health check
app.get('/', (req, res) => res.json({ status: 'ok', service: 'student-backend' }));

// connect Mongo (Railway injects MONGODB_URI)
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.log('❌ MongoDB connection error:', err));

// CRUD
app.post('/students', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: 'Failed to add student' });
  }
});

app.get('/students', async (_req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch {
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

app.put('/students/:id', async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(
      req.params.id, { ...req.body, edited: true }, { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Failed to update student' });
  }
});

app.delete('/students/:id', async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Failed to delete student' });
  }
});

// Force Railway to use 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
