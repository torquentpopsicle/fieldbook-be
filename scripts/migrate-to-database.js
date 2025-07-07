const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

class DatabaseMigration {
  constructor() {
    this.dataPath = path.join(__dirname, '../data');
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
  }

  async runMigrations() {
    console.log('🚀 Starting database migration...');

    try {
      // Only run data migrations, schema migrations are handled separately
      await this.migrateFieldsData();
      await this.migrateFieldDetailsData();

      console.log('🎉 Data migration completed successfully!');
    } catch (error) {
      console.error('💥 Migration failed:', error);
      throw error;
    } finally {
      await this.pool.end();
    }
  }

  async migrateFieldsData() {
    console.log('📊 Migrating fields data...');

    try {
      const fieldsData = JSON.parse(
        fs.readFileSync(path.join(this.dataPath, 'fields.json'), 'utf8')
      );

      for (const field of fieldsData.data) {
        // Get sport_type_id
        const sportTypeResult = await this.pool.query(
          'SELECT id FROM sport_types WHERE name = $1',
          [field.sport_type]
        );

        const sportTypeId = sportTypeResult.rows[0]?.id || null;

        // Insert field
        // Get the first image from field-details.json if available
        let imageUrl = '';
        try {
          const fieldDetailsData = JSON.parse(
            fs.readFileSync(
              path.join(this.dataPath, 'field-details.json'),
              'utf8'
            )
          );
          if (
            fieldDetailsData[field.id] &&
            Array.isArray(fieldDetailsData[field.id].images) &&
            fieldDetailsData[field.id].images.length > 0
          ) {
            imageUrl = fieldDetailsData[field.id].images[0];
          } else if (field.main_image_url) {
            imageUrl = field.main_image_url;
          }
        } catch (e) {
          if (field.main_image_url) {
            imageUrl = field.main_image_url;
          }
        }
        const fieldResult = await this.pool.query(
          `
          INSERT INTO fields (
            id, name, location_summary, sport_type, sport_type_id, rating, 
            reviews_count, capacity, availability_summary, 
            price_per_hour, currency, images
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            location_summary = EXCLUDED.location_summary,
            sport_type = EXCLUDED.sport_type,
            sport_type_id = EXCLUDED.sport_type_id,
            rating = EXCLUDED.rating,
            reviews_count = EXCLUDED.reviews_count,
            capacity = EXCLUDED.capacity,
            availability_summary = EXCLUDED.availability_summary,
            price_per_hour = EXCLUDED.price_per_hour,
            currency = EXCLUDED.currency,
            images = EXCLUDED.images,
            updated_at = CURRENT_TIMESTAMP
          RETURNING id
        `,
          [
            field.id,
            field.name,
            field.location_summary,
            field.sport_type,
            sportTypeId,
            field.rating,
            field.reviews_count,
            field.capacity,
            field.availability_summary,
            field.price_per_hour,
            field.currency,
            imageUrl,
          ]
        );

        // Insert facilities
        if (field.key_facilities && field.key_facilities.length > 0) {
          for (const facilityName of field.key_facilities) {
            // Get or create facility
            let facilityResult = await this.pool.query(
              'SELECT id FROM facilities WHERE name = $1',
              [facilityName]
            );

            if (facilityResult.rows.length === 0) {
              facilityResult = await this.pool.query(
                `
                INSERT INTO facilities (name, description) 
                VALUES ($1, $2) RETURNING id
              `,
                [facilityName, `${facilityName} facility`]
              );
            }

            const facilityId = facilityResult.rows[0].id;

            // Link field to facility
            await this.pool.query(
              `
              INSERT INTO field_facilities (field_id, facility_id)
              VALUES ($1, $2)
              ON CONFLICT (field_id, facility_id) DO NOTHING
            `,
              [field.id, facilityId]
            );
          }
        }

        console.log(`  ✅ Migrated field: ${field.name}`);
      }

      console.log(`  ✅ Migrated ${fieldsData.data.length} fields`);
    } catch (error) {
      console.error('  ❌ Fields migration failed:', error);
      throw error;
    }
  }

  async migrateFieldDetailsData() {
    console.log('📋 Migrating field details data...');

    try {
      const fieldDetailsData = JSON.parse(
        fs.readFileSync(path.join(this.dataPath, 'field-details.json'), 'utf8')
      );

      for (const [fieldId, details] of Object.entries(fieldDetailsData)) {
        // Check if the field exists in the database
        const fieldExists = await this.pool.query(
          'SELECT id FROM fields WHERE id = $1',
          [fieldId]
        );

        if (fieldExists.rows.length === 0) {
          console.log(
            `  ⚠️ Skipping field details for ID ${fieldId} - field not found in database`
          );
          continue;
        }

        // Update field with additional details
        await this.pool.query(
          `
          UPDATE fields 
          SET address = $1, description = $2
          WHERE id = $3
        `,
          [details.address, details.description, fieldId]
        );

        // Update field with images array
        if (details.images && details.images.length > 0) {
          await this.pool.query(
            `
            UPDATE fields 
            SET images = $1
            WHERE id = $2
          `,
            [details.images[0], fieldId]
          );
        }

        // Insert availability slots
        if (details.availability && details.availability.length > 0) {
          for (const slot of details.availability) {
            await this.pool.query(
              `
              INSERT INTO field_availability (field_id, day_of_week, start_time, end_time, is_available)
              VALUES ($1, $2, $3, $4, $5)
              ON CONFLICT (field_id, day_of_week, start_time, end_time) 
              DO UPDATE SET is_available = EXCLUDED.is_available
            `,
              [
                fieldId,
                1, // Default to Monday, can be enhanced later
                slot.start_time,
                slot.end_time,
                slot.is_available,
              ]
            );
          }
        }

        console.log(`  ✅ Migrated details for field: ${details.name}`);
      }

      console.log(
        `  ✅ Migrated ${Object.keys(fieldDetailsData).length} field details`
      );
    } catch (error) {
      console.error('  ❌ Field details migration failed:', error);
      throw error;
    }
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  const migration = new DatabaseMigration();

  migration
    .runMigrations()
    .then(() => {
      console.log('🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = DatabaseMigration;
