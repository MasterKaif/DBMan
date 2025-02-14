import fs from "fs";
import path from "path"


function createMigrationFile(fileName = "migration_default") {
  // Get current timestamp in YYYYMMDD_HHMMSS format
  const timestamp = new Date().toISOString().replace(/[-:T]/g, "").split(".")[0];
  
  // Construct the filename
  const filename = `${timestamp}_${fileName + ".js"}`;
  console.log(fileName)
  const migrationsFolder = path.join("migrations");
  
  // Ensure the migrations folder exists
  if (!fs.existsSync(migrationsFolder)) {
    fs.mkdirSync(migrationsFolder, { recursive: true });
  }
  const fileContent = `
export function up() {
  return('')
}

export function down() {
  return ('')
}
`
  const filePath = path.join(migrationsFolder, filename);
  // Create the file
  fs.writeFileSync(filePath, fileContent, (err) => {
    if (err) {
      console.error("Error creating file:", err);
      process.exit(1);
    }
  });
  
  console.log(`Migration File created: ${filename}`);

}

export default createMigrationFile
