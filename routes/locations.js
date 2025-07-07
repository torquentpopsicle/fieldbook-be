const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// Location Autocomplete
router.get('/autocomplete', (req, res) => {
  const locationsData = dataService.getLocationsData();
  
  if (!locationsData) {
    return res.status(500).json({
      message: 'Error loading locations data',
      error: 'Internal Server Error'
    });
  }

  res.json(locationsData);
});

module.exports = router; 