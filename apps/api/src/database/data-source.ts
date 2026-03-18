import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';

const __dirname = path.resolve();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'auth_db',
  synchronize: true,
  logging: true,
  entities: [path.join(__dirname, '../modules/**/*.entity.{ts,js}')],
  migrations: [path.join(__dirname, './migrations/*.{ts,js}')],
});

export default AppDataSource;
