const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// Featured Fields
router.get('/', (req, res) => {
  const featuredData = dataService.getFeaturedFieldsData();
  
  if (!featuredData) {
    return res.status(500).json({
      message: 'Error loading featured fields data',
      error: 'Internal Server Error'
    });
  }

  res.json(featuredData);
});

module.exports = router; 