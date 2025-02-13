const dbConnection = require("../dbSetup")

exports.getExistingMigration = async() => {
  const query = `SELECT name FROM migrations order by id`

  try {
    const data = await dbConnection.query(query)
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
        await dbConnection.query(createTableQuery);
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

    const query = `
      INSERT INTO migrations (id, name, created_at)
      VALUES ${values}
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        created_at = VALUES(created_at);
    `;

    // Execute the query
    await dbConnection.query(query);
    console.log("Migrations updated successfully.");
  } catch (error) {
    console.error("Error updating migrations table:", error.message);
    throw error;
  }
}

exports.removeMigration = async(migrations) => {
  if (migrations.length === 0) {
    console.log("No migrations to remove.");
    return;
  }
  const values = "( "

  migrations.map((migration) => values += `${migration}, `);
  values += ")"

  const query = `DELETE FROM migration WHERE id IN ${values}`

  try {
    await dbConnection.query(query)
  } catch(error) {
    console.error("Error updating migrations table:", error.message);
    throw error;
  }
}