import pg from "pg";
import config from "../config/index.js";

const pool = new pg.Pool({
	connectionString: config.DATABASE_URL,
});

async function testConnection() {
	let test;
	try {
		console.log("Testando conexão com Banco");
		test = await pool.connect();
		if (test) console.log("Conexão com Banco bem sucedida!");
	} catch (error) {
		console.error("Erro ao conectar ao Banco");
	} finally {
		if (test) test.release();
	}
}

testConnection();

export default pool;
