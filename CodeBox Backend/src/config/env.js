import dotenv from 'dotenv';

dotenv.config({
  // path: process.env.ENV_PATH || '../../.env',
});

const env = {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  SERVER_PORT: process.env.SERVER_PORT,
  DATABASE_URL: process.env.DATABASE_URL
};

export default env;