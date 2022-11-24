import { config } from 'dotenv';

config();

// app
export const HOST = process.env.HOST || 'localhost';
export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// api gateway
export const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3001';

// db
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = process.env.DB_PORT || 3306;
export const DB_USER = process.env.DB_USER || 'api';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'secret';
export const DB_SCHEMA = process.env.DB_SCHEMA || 'payuu';
