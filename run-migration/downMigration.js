const { argv } = require("process");
const dbConnection = require("../dbSetup");
const path = require("path");

const migrationPath = path.join("migration");

async function downMigration(downBy = 1) {
	const query = `SELECT id, name, created_at FROM migrations ORDER BY id LIMIT ${downBy}`;
	try {
		const migrations = await sql(query);
		const migrationNames = migrations.map((migration) => migration.name);

		if (migrationNames.length > 0) {
			console.log("Degrading following migrations:");
			const removedMigrations = [];
			for (const name of migrationNames) {
				console.log(`- ${name}`);
				const migrationPath = path.join(migrationsFolder, name + ".js");
				try {
					// Dynamically import the migration file
					const migration = require(migrationPath);

					if (typeof migration.down === "function") {
						const sqlQuery = migration.down(); // Get the SQL query from the `up` function

						// Execute the SQL query using dbConnection
						await dbConnection.query(sqlQuery);
						removedMigrations.push(missingFile.split("_")[0]);
						console.log(`Successfully removed the migration: ${missingFile}`);
					} else {
						console.error(
							`The file ${missingFile} does not export an 'down' function.`
						);
					}
				} catch (err) {
					console.error(
						`Error processing migration file ${missingFile}:`,
						err.message
					);
					throw err;
				}
			}
			await removeMigration(newMigrations);
		} else {
			console.log("All migration files are present in the database.");
			process.exit(1);
		}
	} catch (error) {
		console.log(err);
	}
}

(async () => {

  function usage() {
    console.log("An Integer number only allowed as argument")
    console.log("eg: npm run migration-down 1")
    process.exit(1)
  }
  // Your async code 
  const args = process.argv.splice(2).map(arg => arg);

  if(args.length > 1) {
    console.log("Invalid Argument")
    usage()
  }

  await downMigration(args[0])
})();