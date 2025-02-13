
function up() {
  return(`CREATE TABLE WiingyData.TEMP_TABLE (
          id VARCHAR(15) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`)
}

function down() {
  return ('DROP TABLE WiingyData.TEMP_TABLE')
}

module.exports = { 
  up,
  down
}  