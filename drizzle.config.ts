export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  driver: "postgresql",
//   dialect: "postgresql",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
}; 