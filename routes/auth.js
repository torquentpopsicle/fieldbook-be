const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// Auth: Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required',
      error: 'Bad Request'
    });
  }

  const user = dataService.findUserByEmail(email);
  
  if (!user || user.password !== password) {
    return res.status(401).json({
      message: 'Email atau password yang Anda masukkan salah.',
      error: 'Unauthorized'
    });
  }

  res.json({
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      access_token: 'dummy.jwt.token'
    }
  });
});

// Auth: Register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ 
      message: 'All fields required.' 
    });
  }

  // Check if email already exists
  if (dataService.emailExists(email)) {
    return res.status(409).json({
      message: 'Email sudah terdaftar. Silakan gunakan email lain.',
      error: 'Conflict'
    });
  }

  // Add new user
  const newUser = dataService.addUser({ name, email, password });
  
  if (!newUser) {
    return res.status(500).json({
      message: 'Error creating user',
      error: 'Internal Server Error'
    });
  }

  res.status(201).json({
    message: 'User registered successfully',
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
});

module.exports = router; 