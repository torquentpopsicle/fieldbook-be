const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// Search Fields
router.get('/', (req, res) => {
  const fieldsData = dataService.getFieldsData();
  
  if (!fieldsData) {
    return res.status(500).json({
      message: 'Error loading fields data',
      error: 'Internal Server Error'
    });
  }

  res.json(fieldsData);
});

// Field Detail
router.get('/:field_id', (req, res) => {
  const { field_id } = req.params;
  const fieldDetails = dataService.getFieldDetails(field_id);
  
  if (!fieldDetails) {
    return res.status(404).json({
      message: 'Field not found',
      error: 'Not Found'
    });
  }

  res.json({
    data: fieldDetails
  });
});

// Filter Options
router.get('/filters', (req, res) => {
  const filtersData = dataService.getFiltersData();
  
  if (!filtersData) {
    return res.status(500).json({
      message: 'Error loading filters data',
      error: 'Internal Server Error'
    });
  }

  res.json(filtersData);
});

module.exports = router; 