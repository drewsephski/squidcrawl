import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Create a connection pool with production-ready settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxUses: 7500,
});

// Create the drizzle database instance with schema
export const db = drizzle(pool, { schema });

// Export the pool for raw queries if needed
export { pool };

// Track if pool has been ended to prevent double-ending
let poolEnded = false;

const gracefulShutdown = () => {
  if (!poolEnded) {
    poolEnded = true;
    pool.end();
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
