import pg from "pg";
import bcrypt from "bcrypt";
import config from "../config/index.js";

const client = new pg.Client({
	connectionString: config.DATABASE_URL,
});

async function seed() {
	try {
		await client.connect();

		console.log("Iniciando criação do admin...");

		const senha = config.SENHA_ADMIN;
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(senha, salt);

		const query = `
    INSERT INTO users (nome, apelido, email, senha, tipo)
    VALUES ($1, $2, $3, $4, $5)
    `;

		await client.query(query, [
			"Administrador",
			"admin",
			"admin@email.com",
			hashedPassword,
			"admin",
		]);

		console.log("Criação do admin realizada com sucesso!");
	} catch (error) {
		if (error.code === "23505") {
			// Código do PostgreSQL para violação de chave única
			console.log("Usuário admin já está Registrado no Banco!");
			return;
		}
		console.error("Erro na Criação do Admin...", error);
	} finally {
		console.log("Processo de Seed Finalizado!");
		await client.end();
	}
}

seed();
