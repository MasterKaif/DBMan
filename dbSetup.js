const sql = require("mysql2/promise");
const dotenv = require("dotenv")
dotenv.config();

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const db = process.env.MIGRATION_DB || process.env.DB || "migrations";

const conn = await sql.createConnection({
	host: dbHost,
	user: dbUser,
	password: dbPassword,
	database: db,
});


module.exports =  conn
