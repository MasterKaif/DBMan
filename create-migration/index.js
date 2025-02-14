#!/usr/bin/env node
import createMigration from "./createMigration.js"

// Collect all arguments passed to this script
const args = process.argv.slice(2).map((arg) => `${arg}`).join(" ");

// Path to the actual script

try {
  if(args.length) {
    createMigration(args)
  }else {
    createMigration()
  }
} catch (error) {
  console.error("Error executing the migration script:", error.message);
}
