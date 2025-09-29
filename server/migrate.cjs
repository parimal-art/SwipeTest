const Database = require('./database');

async function migrate() {
  console.log('Starting database migration...');
  
  try {
    const db = new Database();
    await db.initialize();
    console.log('Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();