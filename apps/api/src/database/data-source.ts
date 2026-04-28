import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USER ?? 'app_user',
  password: process.env.DB_PASS ?? 'pass',
  database: process.env.DB_NAME ?? 'auth_db',

  synchronize: false,
  logging: true,

  entities: [path.join(__dirname, 'src/modules/**/*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'src/database/migrations/*.{ts,js}')],
});

export default AppDataSource;
