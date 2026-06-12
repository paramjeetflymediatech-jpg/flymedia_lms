import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
    database: process.env.MYSQL_DATABASE || 'my_lms_db',
  });

  console.log("Adding reviews table...");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`reviews\` (
      \`id\` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
      \`studentId\` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
      \`tutorId\` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
      \`rating\` int NOT NULL,
      \`comment\` text NOT NULL,
      \`createdAt\` datetime DEFAULT NULL,
      \`updatedAt\` datetime DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`studentId\` (\`studentId\`),
      KEY \`tutorId\` (\`tutorId\`),
      CONSTRAINT \`reviews_ibfk_1\` FOREIGN KEY (\`studentId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`reviews_ibfk_2\` FOREIGN KEY (\`tutorId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log("Reviews table created successfully!");
  await connection.end();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
