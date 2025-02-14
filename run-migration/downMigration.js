#!/usr/bin/env node
import fs from "fs"
import path from "path";
import { query, getConnection } from "../dbSetup.js";
import { removeMigration } from "./utils.js";
import { pathToFileURL } from "url";

// Always resolve migrations folder from the project root
const migrationsFolder = path.resolve(process.cwd(), "migrations");

async function downMigration(downBy = 1) {
  // Fetch the list of migrations to downgrade
  const getQuery = `SELECT id, name, created_at FROM migrations ORDER BY id LIMIT ${downBy}`;
  const connection = await  getConnection();
  try {
    await connection.beginTransaction();
    const [migrations] = await connection.query(getQuery);
    const migrationNames = migrations.map((migration) => migration.name);

    if (migrationNames.length > 0) {
      console.log("Degrading the following migrations:");
      const removedMigrations = [];

      for (const name of migrationNames) {
        console.log(`- ${name}`);
        const migrationPath = path.join(migrationsFolder, name + ".js");
        try {
          // Dynamically import the migration file
          const migration = await import(pathToFileURL(migrationPath).href);

          if (typeof migration.down === "function") {
            const sqlQuery = migration.down(); // Get the SQL query from the `down` function

            // Execute the SQL query
            await connection.query(sqlQuery);
            removedMigrations.push(name.split("_")[0]);
            console.log(`Successfully removed the migration: ${name}`);
          } else {
            console.error(`The file ${name} does not export a 'down' function.`);
            throw new Error(`The file ${name} does not export a 'down' function.`)
          }
        } catch (err) {
          console.error(`Error processing migration file ${name}:`, err.message);
          throw err;
        }
      }
      await removeMigration(removedMigrations);
    } else {
      console.log("No migrations found to downgrade.");
    }
    await connection.commit();
    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error("Error fetching migrations from the database:", error.message);
    process.exit(1);
  }
}

(async () => {
  function usage() {
    console.log("Usage: Provide an integer argument to specify how many migrations to downgrade.");
    console.log("Example: npm run migration-down 1");
    process.exit(1);
  }

  // Parse command-line arguments
  const args = process.argv.slice(2).map((arg) => parseInt(arg, 10));
  if(args.length == 0) args.push(1)

  if (args.length !== 1 || isNaN(args[0]) || args[0] < 1) {
    console.log("Invalid argument.");
    usage();
  }

  await downMigration(args[0]);
})();
