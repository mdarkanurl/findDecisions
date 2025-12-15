import 'dotenv/config';

export default () => ({
  port: parseInt(process.env.PORT!, 10) || 3000,
  DATABASE_URL: process.env.DATABASE_URL|| "postgresql://postgres:6081@localhost:5432/find_decisions",
});