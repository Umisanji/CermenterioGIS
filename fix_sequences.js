import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'cementerios_db',
  password: 'admin123',
  port: 5432,
});

async function fix() {
  const tables = ['difunto', 'titular', 'lote', 'nivel', 'seccion', 'foto', 'tramite'];
  for (const table of tables) {
    const pkCol = `${table}_id`;
    try {
      await pool.query(`
        SELECT setval(pg_get_serial_sequence('${table}', '${pkCol}'), COALESCE(MAX(${pkCol}), 0) + 1, false) 
        FROM ${table};
      `);
      console.log(`Reset sequence for ${table}.${pkCol} successfully.`);
    } catch (e) {
      console.error(`Error resetting ${table}:`, e.message);
    }
  }
  await pool.end();
  console.log('All PostgreSQL sequences synced!');
}

fix();
