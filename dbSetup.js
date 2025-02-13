const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const db = process.env.MIGRATION_DB || process.env.DB || "migrations";

let connection; // Singleton for the connection

// Initialize and return the single connection
async function getConnection() {
  if (!connection) {
    try {
      connection = await mysql.createConnection({
        host: dbHost,
        user: dbUser,
        password: dbPassword,
        database: db,
      });
      console.log("Database connected successfully.");
    } catch (err) {
      console.error("Error connecting to the database:", err);
      throw err;
    }
  }
  return connection;
}

// Reusable query utility for executing SQL queries
async function query(sql, params = []) {
  const conn = await getConnection();
  const [results] = await conn.execute(sql, params); // Execute query safely with params
  return results;
}

// Export the connection initializer and query utility
module.exports = {
  getConnection,
  query,
};
