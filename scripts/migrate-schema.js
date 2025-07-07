const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

class SchemaMigration {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../migrations');
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
  }

  // Parse SQL statements properly, handling dollar-quoted strings
  parseSQLStatements(sql) {
    const statements = [];
    let currentStatement = '';
    let inDollarQuote = false;
    let dollarTag = '';
    let i = 0;

    while (i < sql.length) {
      const char = sql[i];
      const nextChar = sql[i + 1];

      // Check for dollar quote start
      if (char === '$' && nextChar === '$') {
        if (!inDollarQuote) {
          // Find the end of the dollar tag
          let tagEnd = sql.indexOf('$$', i + 2);
          if (tagEnd !== -1) {
            dollarTag = sql.substring(i, tagEnd + 2);
            inDollarQuote = true;
            currentStatement += dollarTag;
            i = tagEnd + 1;
            continue;
          }
        } else {
          // Check for end of dollar quote
          if (sql.substring(i, i + dollarTag.length) === dollarTag) {
            currentStatement += dollarTag;
            inDollarQuote = false;
            dollarTag = '';
            i += dollarTag.length - 1;
            continue;
          }
        }
      }

      // If we're in a dollar quote, just add the character
      if (inDollarQuote) {
        currentStatement += char;
        i++;
        continue;
      }

      // Handle semicolons outside of dollar quotes
      if (char === ';' && !inDollarQuote) {
        currentStatement += char;
        const trimmed = currentStatement.trim();
        if (trimmed.length > 0) {
          statements.push(trimmed);
        }
        currentStatement = '';
      } else {
        currentStatement += char;
      }

      i++;
    }

    // Add any remaining statement
    const trimmed = currentStatement.trim();
    if (trimmed.length > 0) {
      statements.push(trimmed);
    }

    return statements;
  }

  async runSchemaMigrations() {
    console.log('🗄️ Running schema migrations...');

    try {
      // Get all SQL migration files
      const migrationFiles = fs
        .readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();

      console.log(`📁 Found ${migrationFiles.length} migration files`);

      for (const file of migrationFiles) {
        console.log(`\n📄 Running migration: ${file}`);

        try {
          const sql = fs.readFileSync(
            path.join(this.migrationsPath, file),
            'utf8'
          );

          // Parse SQL statements properly
          const statements = this.parseSQLStatements(sql);

          for (const statement of statements) {
            if (statement.trim()) {
              try {
                await this.pool.query(statement);
              } catch (error) {
                // Handle specific errors gracefully
                if (
                  error.code === '42710' &&
                  error.message.includes('already exists')
                ) {
                  console.log(
                    `  ⚠️ Skipping: ${error.message.split('"')[1]} already exists`
                  );
                } else if (
                  error.code === '42P07' &&
                  error.message.includes('already exists')
                ) {
                  console.log(
                    `  ⚠️ Skipping: ${error.message.split('"')[1]} already exists`
                  );
                } else {
                  throw error; // Re-throw other errors
                }
              }
            }
          }

          console.log(`  ✅ ${file} completed`);
        } catch (error) {
          console.error(`  ❌ ${file} failed:`, error.message);
          // Continue with other migrations even if one fails
        }
      }

      console.log('\n🎉 Schema migrations completed!');
    } catch (error) {
      console.error('💥 Schema migration failed:', error);
      throw error;
    } finally {
      await this.pool.end();
    }
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  const migration = new SchemaMigration();

  migration
    .runSchemaMigrations()
    .then(() => {
      console.log('✅ Schema migration completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Schema migration failed:', error);
      process.exit(1);
    });
}

module.exports = SchemaMigration;
