import mysql, { type Pool, type PoolOptions } from 'mysql2/promise';

export interface MysqlClientOptions extends PoolOptions {}

export function createMysqlPool(options: MysqlClientOptions): Pool {
  return mysql.createPool({
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ...options,
  });
}
