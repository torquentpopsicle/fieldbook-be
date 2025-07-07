const pool = require('./db');

class UserService {
  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  async findUserByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.name - User name
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @returns {Promise<Object>} Created user object
   */
  async createUser({ name, email, password }) {
    try {
      const query = `
        INSERT INTO users (name, email, password, role) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, name, email, role, created_at
      `;
      const values = [name, email, password, 'customer'];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Check if email already exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if email exists
   */
  async emailExists(email) {
    try {
      const user = await this.findUserByEmail(email);
      return user !== null;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  async findUserById(id) {
    try {
      const query =
        'SELECT id, name, email, role, created_at FROM users WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Update user information
   * @param {string} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user object
   */
  async updateUser(id, updateData) {
    try {
      const fields = Object.keys(updateData);
      const values = Object.values(updateData);
      const setClause = fields
        .map((field, index) => `${field} = $${index + 2}`)
        .join(', ');

      const query = `
        UPDATE users 
        SET ${setClause}, updated_at = NOW() 
        WHERE id = $1 
        RETURNING id, name, email, role, created_at, updated_at
      `;

      const result = await pool.query(query, [id, ...values]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Get all users (Admin only)
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 10)
   * @param {string} options.role - Filter by role
   * @param {string} options.search - Search by name or email
   * @returns {Promise<Object>} Paginated users result
   */
  async getAllUsers(options = {}) {
    try {
      const { page = 1, limit = 10, role, search } = options;
      const offset = (page - 1) * limit;

      let whereConditions = [];
      let values = [];
      let valueIndex = 1;

      // Add role filter
      if (role) {
        whereConditions.push(`role = $${valueIndex}`);
        values.push(role);
        valueIndex++;
      }

      // Add search filter
      if (search) {
        whereConditions.push(
          `(name ILIKE $${valueIndex} OR email ILIKE $${valueIndex})`
        );
        values.push(`%${search}%`);
        valueIndex++;
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(' AND ')}`
          : '';

      // Get total count
      const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
      const countResult = await pool.query(countQuery, values);
      const totalUsers = parseInt(countResult.rows[0].count);

      // Get users with pagination
      const usersQuery = `
        SELECT id, name, email, role, created_at, updated_at 
        FROM users 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
      `;

      const usersResult = await pool.query(usersQuery, [
        ...values,
        limit,
        offset,
      ]);

      return {
        users: usersResult.rows,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(totalUsers / limit),
          total_users: totalUsers,
          limit: limit,
        },
      };
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  /**
   * Delete a user (Admin only)
   * @param {string} id - User ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteUser(id) {
    try {
      const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
      const result = await pool.query(query, [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Update user role (Admin only)
   * @param {string} id - User ID
   * @param {string} role - New role
   * @returns {Promise<Object>} Updated user object
   */
  async updateUserRole(id, role) {
    try {
      const query = `
        UPDATE users 
        SET role = $2, updated_at = NOW() 
        WHERE id = $1 
        RETURNING id, name, email, role, created_at, updated_at
      `;

      const result = await pool.query(query, [id, role]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  /**
   * Get user statistics (Admin only)
   * @returns {Promise<Object>} User statistics
   */
  async getUserStatistics() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'customer' THEN 1 END) as customers,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_last_30_days
        FROM users
      `;

      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
