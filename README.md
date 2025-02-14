# **schemsync**

**Maintain your database schema history and migrations without ORM overhead.**

`schemsync` is a lightweight command-line tool for managing database migrations and schema versioning. It focuses on simplicity and avoids the complexities of ORMs, making it perfect for developers who prefer direct control over their SQL migrations.

---

## **Features**

- Create timestamped migration files.
- Run migrations (`up` or `down`) in sequence.
- Lightweight and ORM-independent.
- Support for `.env` configuration and MySQL databases (via `mysql2`).

---

## **Installation**

Install `schemsync` globally via npm:

```bash
npm install -g schemsync


# schemsync Usage Guide

## 1. Create a Migration File
Run the following command to generate a new migration file:

```bash
schemsync-create <migration_name>
```

### Example:
```bash
schemsync-create add_users_table
```
**Output:** A new file is created in the `migrations/` folder with the format: `YYYYMMDD_HHMMSS_add_users_table.js`.

---

## 2. Run Migrations (Up)
Execute all pending migrations to apply schema changes:

```bash
schemsync-up
```
**Note:** The tool applies migration files in chronological order.

---

## 3. Rollback Migrations (Down)
Revert the most recently applied migration:

```bash
schemsync-down
```

---

## Configuration
`schemsync` uses environment variables for database connection configuration. Add a `.env` file in your project root with the following content:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=my_database
```

---

## File Structure
A typical project using `schemsync` will have the following structure:

```bash
project/
│
├── migrations/                # Migration files
├── .env                       # Database configuration
├── package.json
```

---

## Migration File Example
Each migration file should export `up` and `down` functions that return SQL query strings for schema updates and rollbacks. 

### Example:
```javascript
module.exports = {
  up: () => `
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  down: () => `
    DROP TABLE users;
  `
};
```

---

## Requirements
- Node.js v14+
- MySQL database

---

## License
This project is licensed under the MIT License.

---

## Author
Created by **Kaif**.
