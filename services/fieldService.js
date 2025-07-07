const pool = require('./db');

class FieldService {
  /**
   * Get all fields with optional filtering and pagination
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.sportType - Filter by sport type
   * @param {string} options.location - Filter by location
   * @param {number} options.minPrice - Minimum price filter
   * @param {number} options.maxPrice - Maximum price filter
   * @param {string} options.facility - Filter by facility
   * @returns {Promise<Object>} Paginated fields result
   */
  async getAllFields(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sportType,
        location,
        minPrice,
        maxPrice,
        facility,
      } = options;

      const offset = (page - 1) * limit;
      let whereConditions = [];
      let values = [];
      let valueIndex = 1;

      // Build WHERE clause
      if (sportType) {
        whereConditions.push(
          `(f.sport_type = $${valueIndex} OR st.name = $${valueIndex})`
        );
        values.push(sportType);
        valueIndex++;
      }

      if (location) {
        whereConditions.push(`f.location_summary ILIKE $${valueIndex}`);
        values.push(`%${location}%`);
        valueIndex++;
      }

      if (minPrice) {
        whereConditions.push(`f.price_per_hour >= $${valueIndex}`);
        values.push(minPrice);
        valueIndex++;
      }

      if (maxPrice) {
        whereConditions.push(`f.price_per_hour <= $${valueIndex}`);
        values.push(maxPrice);
        valueIndex++;
      }

      if (facility) {
        whereConditions.push(`fac.name = $${valueIndex}`);
        values.push(facility);
        valueIndex++;
      }

      whereConditions.push('f.is_active = true');

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(' AND ')}`
          : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(DISTINCT f.id) 
        FROM fields f
        LEFT JOIN sport_types st ON f.sport_type_id = st.id
        LEFT JOIN field_facilities ff ON f.id = ff.field_id
        LEFT JOIN facilities fac ON ff.facility_id = fac.id
        ${whereClause}
      `;

      const countResult = await pool.query(countQuery, values);
      const totalFields = parseInt(countResult.rows[0].count);

      // Get fields with pagination
      const fieldsQuery = `
        SELECT DISTINCT
          f.id,
          f.name,
          f.location_summary,
          f.sport_type,
          f.rating,
          f.reviews_count,
          f.main_image_url,
          f.capacity,
          f.availability_summary,
          f.price_per_hour,
          f.currency,
          f.created_at,
          f.updated_at,
          ARRAY_AGG(DISTINCT fac.name) FILTER (WHERE fac.name IS NOT NULL) as key_facilities
        FROM fields f
        LEFT JOIN sport_types st ON f.sport_type_id = st.id
        LEFT JOIN field_facilities ff ON f.id = ff.field_id
        LEFT JOIN facilities fac ON ff.facility_id = fac.id
        ${whereClause}
        GROUP BY f.id, f.name, f.location_summary, f.sport_type, f.rating, 
                 f.reviews_count, f.main_image_url, f.capacity, f.availability_summary, 
                 f.price_per_hour, f.currency, f.created_at, f.updated_at
        ORDER BY f.created_at DESC
        LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
      `;

      const fieldsResult = await pool.query(fieldsQuery, [
        ...values,
        limit,
        offset,
      ]);

      console.log('✅ FIELDS QUERY:', {
        totalFields,
        returnedFields: fieldsResult.rows.length,
        filters: { sportType, location, minPrice, maxPrice, facility },
        page,
        limit,
      });

      return {
        data: fieldsResult.rows,
        pagination: {
          total_results: totalFields,
          current_page: page,
          total_pages: Math.ceil(totalFields / limit),
          limit: limit,
        },
      };
    } catch (error) {
      console.error('❌ FIELDS QUERY ERROR:', error);
      throw new Error('Failed to retrieve fields');
    }
  }

  /**
   * Get field by ID with all related data
   * @param {number} fieldId - Field ID
   * @returns {Promise<Object|null>} Field object or null
   */
  async getFieldById(fieldId) {
    try {
      // Get field details
      const fieldQuery = `
        SELECT 
          f.*,
          st.name as sport_type_name,
          ARRAY_AGG(DISTINCT fac.name) FILTER (WHERE fac.name IS NOT NULL) as facilities
        FROM fields f
        LEFT JOIN sport_types st ON f.sport_type_id = st.id
        LEFT JOIN field_facilities ff ON f.id = ff.field_id
        LEFT JOIN facilities fac ON ff.facility_id = fac.id
        WHERE f.id = $1 AND f.is_active = true
        GROUP BY f.id, st.name
      `;

      const fieldResult = await pool.query(fieldQuery, [fieldId]);

      if (fieldResult.rows.length === 0) {
        return null;
      }

      const field = fieldResult.rows[0];

      // Images are now stored directly in the fields table as an array
      // field.images is already available from the main query

      // Get availability
      const availabilityQuery = `
        SELECT day_of_week, start_time, end_time, is_available
        FROM field_availability
        WHERE field_id = $1
        ORDER BY day_of_week, start_time
      `;

      const availabilityResult = await pool.query(availabilityQuery, [fieldId]);
      field.availability = availabilityResult.rows;

      console.log('✅ FIELD DETAILS QUERY:', {
        fieldId,
        fieldName: field.name,
        imagesCount: field.images.length,
        availabilitySlots: field.availability.length,
      });

      return field;
    } catch (error) {
      console.error('❌ FIELD DETAILS QUERY ERROR:', error);
      throw new Error('Failed to retrieve field details');
    }
  }

  /**
   * Create a new field
   * @param {Object} fieldData - Field data
   * @returns {Promise<Object>} Created field object
   */
  async createField(fieldData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Insert field
      const fieldQuery = `
        INSERT INTO fields (
          name, location_summary, address, sport_type, sport_type_id,
          rating, reviews_count, main_image_url, capacity, availability_summary,
          price_per_hour, currency, description, images
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `;

      const sportTypeResult = await client.query(
        'SELECT id FROM sport_types WHERE name = $1',
        [fieldData.sport_type]
      );

      const sportTypeId = sportTypeResult.rows[0]?.id || null;

      const fieldResult = await client.query(fieldQuery, [
        fieldData.name,
        fieldData.location_summary,
        fieldData.address,
        fieldData.sport_type,
        sportTypeId,
        fieldData.rating || 0,
        fieldData.reviews_count || 0,
        fieldData.main_image_url,
        fieldData.capacity,
        fieldData.availability_summary,
        fieldData.price_per_hour,
        fieldData.currency || 'Rp',
        fieldData.description,
        fieldData.images || [],
      ]);

      const field = fieldResult.rows[0];

      // Insert facilities if provided
      if (fieldData.facilities && fieldData.facilities.length > 0) {
        for (const facilityName of fieldData.facilities) {
          let facilityResult = await client.query(
            'SELECT id FROM facilities WHERE name = $1',
            [facilityName]
          );

          if (facilityResult.rows.length === 0) {
            facilityResult = await client.query(
              `
              INSERT INTO facilities (name, description)
              VALUES ($1, $2) RETURNING id
            `,
              [facilityName, `${facilityName} facility`]
            );
          }

          await client.query(
            `
            INSERT INTO field_facilities (field_id, facility_id)
            VALUES ($1, $2)
          `,
            [field.id, facilityResult.rows[0].id]
          );
        }
      }

      // Images are now stored directly in the fields table as an array
      // No separate insertion needed since images are part of the field record

      await client.query('COMMIT');

      console.log('✅ FIELD CREATED:', {
        fieldId: field.id,
        fieldName: field.name,
        sportType: field.sport_type,
      });

      return field;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ FIELD CREATE ERROR:', error);
      throw new Error('Failed to create field');
    } finally {
      client.release();
    }
  }

  /**
   * Update an existing field
   * @param {number} fieldId - Field ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated field object or null
   */
  async updateField(fieldId, updateData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if field exists
      const existingField = await client.query(
        'SELECT id FROM fields WHERE id = $1 AND is_active = true',
        [fieldId]
      );

      if (existingField.rows.length === 0) {
        return null;
      }

      // Update field
      const updateFields = [];
      const values = [];
      let valueIndex = 1;

      Object.keys(updateData).forEach(key => {
        if (key !== 'facilities') {
          updateFields.push(`${key} = $${valueIndex}`);
          values.push(updateData[key]);
          valueIndex++;
        }
      });

      // Always update the updated_at timestamp
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

      if (updateFields.length > 0) {
        const updateQuery = `
          UPDATE fields 
          SET ${updateFields.join(', ')}
          WHERE id = $${valueIndex}
          RETURNING *
        `;

        const result = await client.query(updateQuery, [...values, fieldId]);
        const field = result.rows[0];

        // Update facilities if provided
        if (updateData.facilities) {
          // Remove existing facilities
          await client.query(
            'DELETE FROM field_facilities WHERE field_id = $1',
            [fieldId]
          );

          // Add new facilities
          for (const facilityName of updateData.facilities) {
            let facilityResult = await client.query(
              'SELECT id FROM facilities WHERE name = $1',
              [facilityName]
            );

            if (facilityResult.rows.length === 0) {
              facilityResult = await client.query(
                `
                INSERT INTO facilities (name, description)
                VALUES ($1, $2) RETURNING id
              `,
                [facilityName, `${facilityName} facility`]
              );
            }

            await client.query(
              `
              INSERT INTO field_facilities (field_id, facility_id)
              VALUES ($1, $2)
            `,
              [fieldId, facilityResult.rows[0].id]
            );
          }
        }

        await client.query('COMMIT');

        console.log('✅ FIELD UPDATED:', {
          fieldId,
          fieldName: field.name,
          updatedFields: Object.keys(updateData),
        });

        return field;
      }

      await client.query('COMMIT');
      return null;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ FIELD UPDATE ERROR:', error);
      throw new Error('Failed to update field');
    } finally {
      client.release();
    }
  }

  /**
   * Delete a field (soft delete)
   * @param {number} fieldId - Field ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteField(fieldId) {
    try {
      const result = await pool.query(
        `
        UPDATE fields 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND is_active = true
        RETURNING id
      `,
        [fieldId]
      );

      const deleted = result.rows.length > 0;

      if (deleted) {
        console.log('✅ FIELD DELETED:', { fieldId });
      } else {
        console.log('⚠️ FIELD NOT FOUND OR ALREADY DELETED:', { fieldId });
      }

      return deleted;
    } catch (error) {
      console.error('❌ FIELD DELETE ERROR:', error);
      throw new Error('Failed to delete field');
    }
  }

  /**
   * Get filter options for fields
   * @returns {Promise<Object>} Filter options
   */
  async getFilterOptions() {
    try {
      // Get price range
      const priceResult = await pool.query(`
        SELECT MIN(price_per_hour) as min, MAX(price_per_hour) as max
        FROM fields WHERE is_active = true
      `);

      // Get facilities
      const facilitiesResult = await pool.query(`
        SELECT DISTINCT f.name, f.description, f.icon
        FROM facilities f
        INNER JOIN field_facilities ff ON f.id = ff.facility_id
        INNER JOIN fields fi ON ff.field_id = fi.id
        WHERE fi.is_active = true
        ORDER BY f.name
      `);

      // Get sport types
      const sportTypesResult = await pool.query(`
        SELECT DISTINCT st.id, st.name, st.description
        FROM sport_types st
        INNER JOIN fields f ON st.id = f.sport_type_id
        WHERE f.is_active = true
        ORDER BY st.name
      `);

      console.log('✅ FILTER OPTIONS QUERY:', {
        priceRange: priceResult.rows[0],
        facilitiesCount: facilitiesResult.rows.length,
        sportTypesCount: sportTypesResult.rows.length,
      });

      return {
        price_range: priceResult.rows[0],
        features: facilitiesResult.rows.map(row => ({
          id: row.name.toLowerCase().replace(/\s+/g, '_'),
          name: row.name,
        })),
        sport_types: sportTypesResult.rows.map(row => ({
          id: row.id,
          name: row.name,
        })),
      };
    } catch (error) {
      console.error('❌ FILTER OPTIONS QUERY ERROR:', error);
      throw new Error('Failed to retrieve filter options');
    }
  }
}

module.exports = new FieldService();
