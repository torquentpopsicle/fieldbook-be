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
      role: 'customer',
    };

    usersData.users.push(newUser);

    // Update the cache
    this.cache['users.json'] = usersData;

    return newUser;
  }

  // Generate booking ID
  generateBookingId() {
    const date = new Date();
    const dateStr =
      date.getFullYear().toString() +
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
        payment_due: paymentDue.toISOString(),
      },
    };
  }

  // Save data to JSON file
  saveDataFile(filename, data) {
    try {
      const filePath = path.join(this.dataPath, filename);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      this.cache[filename] = data; // Update cache
      return true;
    } catch (error) {
      console.error(`Error saving data file ${filename}:`, error.message);
      return false;
    }
  }

  // Create a new field
  createField(fieldData) {
    const fieldsData = this.getFieldsData();
    if (!fieldsData || !fieldsData.data) return null;

    const newField = {
      id: Math.max(...fieldsData.data.map(f => f.id)) + 1,
      ...fieldData,
      reviews_count: 0,
      rating: 0,
    };

    fieldsData.data.push(newField);

    if (this.saveDataFile('fields.json', fieldsData)) {
      return newField;
    }
    return null;
  }

  // Update an existing field
  updateField(fieldId, updateData) {
    const fieldsData = this.getFieldsData();
    if (!fieldsData || !fieldsData.data) return null;

    const fieldIndex = fieldsData.data.findIndex(f => f.id == fieldId);
    if (fieldIndex === -1) return null;

    fieldsData.data[fieldIndex] = {
      ...fieldsData.data[fieldIndex],
      ...updateData,
    };

    if (this.saveDataFile('fields.json', fieldsData)) {
      return fieldsData.data[fieldIndex];
    }
    return null;
  }

  // Delete a field
  deleteField(fieldId) {
    const fieldsData = this.getFieldsData();
    if (!fieldsData || !fieldsData.data) return false;

    const fieldIndex = fieldsData.data.findIndex(f => f.id == fieldId);
    if (fieldIndex === -1) return false;

    fieldsData.data.splice(fieldIndex, 1);

    return this.saveDataFile('fields.json', fieldsData);
  }

  // Create a new field detail entry
  createFieldDetail(fieldId, detailData) {
    const fieldDetails = this.loadDataFile('field-details.json') || {};

    fieldDetails[fieldId] = {
      id: parseInt(fieldId),
      ...detailData,
    };

    return this.saveDataFile('field-details.json', fieldDetails);
  }

  // Update field details
  updateFieldDetail(fieldId, updateData) {
    const fieldDetails = this.loadDataFile('field-details.json');
    if (!fieldDetails || !fieldDetails[fieldId]) return null;

    fieldDetails[fieldId] = { ...fieldDetails[fieldId], ...updateData };

    if (this.saveDataFile('field-details.json', fieldDetails)) {
      return fieldDetails[fieldId];
    }
    return null;
  }

  // Get or create bookings data file
  getBookingsData() {
    let bookingsData = this.loadDataFile('bookings.json');
    if (!bookingsData) {
      bookingsData = { bookings: [] };
      this.saveDataFile('bookings.json', bookingsData);
    }
    return bookingsData;
  }

  // Create a new booking
  createBooking(bookingData) {
    const bookingsData = this.getBookingsData();

    const newBooking = {
      id: this.generateBookingId(),
      ...bookingData,
      status: 'pending_payment',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    bookingsData.bookings.push(newBooking);

    if (this.saveDataFile('bookings.json', bookingsData)) {
      return newBooking;
    }
    return null;
  }

  // Get all bookings
  getAllBookings() {
    const bookingsData = this.getBookingsData();
    return bookingsData.bookings || [];
  }

  // Get booking by ID
  getBookingById(bookingId) {
    const bookings = this.getAllBookings();
    return bookings.find(b => b.id === bookingId) || null;
  }

  // Update a booking
  updateBooking(bookingId, updateData) {
    const bookingsData = this.getBookingsData();
    const bookingIndex = bookingsData.bookings.findIndex(
      b => b.id === bookingId
    );

    if (bookingIndex === -1) return null;

    bookingsData.bookings[bookingIndex] = {
      ...bookingsData.bookings[bookingIndex],
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    if (this.saveDataFile('bookings.json', bookingsData)) {
      return bookingsData.bookings[bookingIndex];
    }
    return null;
  }

  // Cancel a booking
  cancelBooking(bookingId) {
    return this.updateBooking(bookingId, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    });
  }
}

module.exports = new DataService();
