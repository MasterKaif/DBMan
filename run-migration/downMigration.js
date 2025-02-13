#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { query } = require("../dbSetup");
const { removeMigration } = require("./utils");

// Always resolve migrations folder from the project root
const migrationsFolder = path.resolve(process.cwd(), "migrations");

async function downMigration(downBy = 1) {
  // Fetch the list of migrations to downgrade
  const getQuery = `SELECT id, name, created_at FROM migrations ORDER BY id LIMIT ${downBy}`;
  try {
    const migrations = await query(getQuery);
    const migrationNames = migrations.map((migration) => migration.name);

    if (migrationNames.length > 0) {
      console.log("Degrading the following migrations:");
      const removedMigrations = [];

      for (const name of migrationNames) {
        console.log(`- ${name}`);
        const migrationPath = path.join(migrationsFolder, name + ".js");
        try {
          // Dynamically import the migration file
          const migration = require(migrationPath);

          if (typeof migration.down === "function") {
            const sqlQuery = migration.down(); // Get the SQL query from the `down` function

            // Execute the SQL query
            await query(sqlQuery);
            removedMigrations.push(name.split("_")[0]);
            console.log(`Successfully removed the migration: ${name}`);
          } else {
            console.error(`The file ${name} does not export a 'down' function.`);
          }
        } catch (err) {
          console.error(`Error processing migration file ${name}:`, err.message);
          throw err;
        }
      }
      await removeMigration(removedMigrations);
      process.exit(0);
    } else {
      console.log("No migrations found to downgrade.");
      process.exit(1);
    }
  } catch (error) {
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
