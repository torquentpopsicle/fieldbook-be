const fs = require('fs');
const path = require('path');

class DataService {
  constructor() {
    this.dataPath = path.join(__dirname, '../data');
    this.cache = {};
  }

  // Load JSON file and cache it
  loadDataFile(filename) {
    if (this.cache[filename]) {
      return this.cache[filename];
    }

    try {
      const filePath = path.join(this.dataPath, filename);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      this.cache[filename] = data;
      return data;
    } catch (error) {
      console.error(`Error loading data file ${filename}:`, error.message);
      return null;
    }
  }

  // Get all fields data
  getFieldsData() {
    return this.loadDataFile('fields.json');
  }

  // Get field details by ID
  getFieldDetails(fieldId) {
    const fieldDetails = this.loadDataFile('field-details.json');
    return fieldDetails[fieldId] || null;
  }

  // Get filters data
  getFiltersData() {
    return this.loadDataFile('filters.json');
  }

  // Get featured fields data
  getFeaturedFieldsData() {
    return this.loadDataFile('featured-fields.json');
  }

  // Get locations data
  getLocationsData() {
    return this.loadDataFile('locations.json');
  }

  // Get users data
  getUsersData() {
    return this.loadDataFile('users.json');
  }

  // Find user by email
  findUserByEmail(email) {
    const usersData = this.getUsersData();
    if (!usersData || !usersData.users) return null;
    
    return usersData.users.find(user => user.email === email) || null;
  }

  // Check if email exists
  emailExists(email) {
    const user = this.findUserByEmail(email);
    return user !== null;
  }

  // Generate new user ID
  generateUserId() {
    return 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Add new user
  addUser(userData) {
    const usersData = this.getUsersData();
    if (!usersData || !usersData.users) return null;

    const newUser = {
      id: this.generateUserId(),
      ...userData,
      role: 'customer'
    };

    usersData.users.push(newUser);
    
    // Update the cache
    this.cache['users.json'] = usersData;
    
    return newUser;
  }

  // Generate booking ID
  generateBookingId() {
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    const randomStr = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `BK-${dateStr}-${randomStr}`;
  }

  // Create booking response
  createBookingResponse(totalPrice) {
    const paymentDue = new Date();
    paymentDue.setHours(paymentDue.getHours() + 1); // Payment due in 1 hour

    return {
      data: {
        booking_id: this.generateBookingId(),
        status: 'pending_payment',
        total_price: totalPrice,
        payment_due: paymentDue.toISOString()
      }
    };
  }
}

module.exports = new DataService(); 