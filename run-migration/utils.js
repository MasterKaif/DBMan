const { query } = require("../dbSetup")
const dotenv = require("dotenv")
dotenv.config();

exports.getExistingMigration = async() => {
  const getQuery = `SELECT name FROM migrations order by id`

  try {
    const data = await query(getQuery)
    return data
  } catch(error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      // Create the migrations table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE migrations (
          id VARCHAR(15) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      try {
        await getQuery(createTableQuery);
        console.log("Migrations table created successfully.");
        return []; // Return an empty array since no migrations exist
      } catch (createError) {
        console.error("Error creating migrations table:", createError.message);
        throw createError; // Rethrow if the table creation fails
      }
    } else {
      console.error("Error querying migrations table:", error.message);
      throw error; // Rethrow any other errors
    }
  }
}

exports.updateMigrations = async(migrations) => {
  try {
    if (migrations.length === 0) {
      console.log("No migrations to update.");
      return;
    }

    // Validate migrations
    const invalidMigrations = migrations.filter(
      (migration) => !migration.id || !migration.name
    );

    if (invalidMigrations.length > 0) {
      console.error("The following migrations are invalid (missing id or name):");
      console.error(invalidMigrations);
      throw new Error("Invalid migrations detected.");
    }

    // Construct the bulk query
    const values = migrations
      .map(
        (migration) => `('${migration.id}', '${migration.name}', NOW())`
      )
      .join(", ");

    const insertQuery = `
      INSERT INTO migrations (id, name, created_at)
      VALUES ${values}
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        created_at = VALUES(created_at);
    `;

    // Execute the query
    await query(insertQuery);
    console.log("Migrations updated successfully.");
  } catch (error) {
    console.error("Error updating migrations table:", error.message);
    throw error;
  }
}

exports.removeMigration = async (migrations) => {
  if (migrations.length === 0) {
    console.log("No migrations to remove.");
    return;
  }

  // Join migration IDs with commas
  const values = migrations.map((migration) => `'${migration}'`).join(", ");
  
  // Construct the DELETE query
  const deleteQuery = `DELETE FROM migrations WHERE id IN (${values})`;

  try {
    await query(deleteQuery);
    console.log(`Successfully removed migrations: ${migrations.join(", ")}`);
  } catch (error) {
    console.error("Error updating migrations table:", error.message);
    throw error;
  }
};
