import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "../config/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new pg.Client({
	user: config.POSTGRES_USER,
	password: config.POSTGRES_PASSWORD,
	host: config.DB_HOST,
	port: config.DB_PORT,
	database: config.POSTGRES_DB,
});

async function runMigrations() {
	try {
		await client.connect();
		const files = fs
			.readdirSync(__dirname)
			.filter((file) => file.endsWith(".sql"))
			.sort();

		console.log("Executing Migrations...");
		await client.query("BEGIN");

		for (const file of files) {
			const filePath = path.join(__dirname, file);
			const sql = fs.readFileSync(filePath, "utf-8");
			await client.query(sql);
			console.log(`Migration ${file} executed successfully.`);
		}

		await client.query("COMMIT");
	} catch (error) {
		await client.query("ROLLBACK");
		console.error("Error running migrations:", error);
	} finally {
		console.log("Finished running Migrations!");
		await client.end();
	}
}

runMigrations();
