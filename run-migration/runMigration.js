#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { query } = require("../dbSetup");
const { getExistingMigration, updateMigrations } = require("./utils");

// Always resolve migrations folder from the project root
const migrationsFolder = path.resolve(process.cwd(), "migrations"); // `process.cwd()` ensures root directory

async function runMigration() {
  // Check if the migrations folder exists
  if (!fs.existsSync(migrationsFolder)) {
    console.error("Error: Migrations folder does not exist.");
    process.exit(1);
  }

  // Read the list of files in the migrations folder
  try {
    const files = fs.readdirSync(migrationsFolder).sort();

    if (files.length === 0) {
      console.log("No files found in the migrations folder.");
      process.exit(1);
    }

    const existingMigrations = await getExistingMigration();

    // Extract migration names from the database
    const existingMigrationNames = existingMigrations.map((migration) => migration.name);
    const fileNames = files.map((file) => file.split(".")[0]);

    // Check for missing files in the database
    const missingMigrations = fileNames.filter((file) => !existingMigrationNames.includes(file));

    if (missingMigrations.length > 0) {
      console.log("The following migration files are missing in the database:");
      const newMigrations = [];
      for (const missingFile of missingMigrations) {
        console.log(`- ${missingFile}`);
        const migrationPath = path.join(migrationsFolder, missingFile + ".js");
        try {
          // Dynamically import the migration file
          const migration = require(migrationPath);

          if (typeof migration.up === "function") {
            const sqlQuery = migration.up(); // Get the SQL query from the `up` function

            // Execute the SQL query using dbConnection
            await query(sqlQuery);
            newMigrations.push({
              id: missingFile.split("_")[0],
              name: missingFile.split(".")[0],
            });
            console.log(`Successfully executed the migration: ${missingFile}`);
          } else {
            console.error(`The file ${missingFile} does not export an 'up' function.`);
          }
        } catch (err) {
          console.error(`Error processing migration file ${missingFile}:`, err.message);
          throw err;
        }
      }
      await updateMigrations(newMigrations);
      process.exit(0);
    } else {
      console.log("All migration files are present in the database.");
      process.exit(0);
    }
  } catch (err) {
    console.error("Error reading the migrations folder:", err.message);
    process.exit(1);
  }
}

(async () => {
  await runMigration();
})();
