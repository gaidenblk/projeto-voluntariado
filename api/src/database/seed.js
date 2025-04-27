import pg from "pg";
import config from "../config/index.js";
import { hashPassword } from "../utils/passwords.js";

const client = new pg.Client({
	user: config.POSTGRES_USER,
	password: config.POSTGRES_PASSWORD,
	host: config.DB_HOST,
	port: config.DB_PORT,
	database: config.POSTGRES_DB,
});

async function seed() {
	try {
		await client.connect();

		console.log("Iniciando criação do admin...");

		const senha = config.SENHA_ADMIN;
		const hashedPassword = await hashPassword(senha);
		const query = `
    INSERT INTO users (nome, apelido, email, senha, tipo)
    SELECT $1, $2, $3, $4, $5
    WHERE NOT EXISTS (
        SELECT 1 FROM users WHERE tipo = 'admin'
    )
    RETURNING id;
`;

		const { rows } = await client.query(query, [
			"Administrador",
			"admin",
			"admin@email.com",
			hashedPassword,
			"admin",
		]);

		if (rows.length === 0) {
			console.error("Já existe um usuário administrador no sistema.");
			return;
		}

		console.log("Criação do admin realizada com sucesso!");
	} catch (error) {
		console.error(error);
	} finally {
		console.log("Processo de Seed Finalizado!");
		await client.end();
	}
}

seed();
