require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

/** @type {import("drizzle-kit").Config} */
module.exports = {
  schema: "./src/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL,
  },
};
