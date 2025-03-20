import pool from "../database/index.js";
import { InternalServerException } from "../utils/exceptions.js";

export const userRepository = {
	create: async (nome, apelido, email, senha) => {
		const client = await pool.connect();
		const query = `INSERT INTO users (nome, apelido, email, senha) VALUES ($1, $2, $3, $4) RETURNING id, nome, apelido ,email`;
		try {
			const { rows } = await client.query(query, [nome, apelido, email, senha]);
			return rows[0];
		} catch (error) {
			throw new InternalServerException("Erro ao criar usuário");
		} finally {
			client.release();
		}
	},

	findByEmail: async (email) => {
		const client = await pool.connect();
		const query = `SELECT id, nome, email, senha FROM users WHERE email = $1`;
		try {
			const { rows } = await client.query(query, [email]);
			return rows[0];
		} catch (error) {
			throw new InternalServerException("Erro ao buscar usuário");
		} finally {
			client.release();
		}
	},

	findByUsername: async (apelido) => {
		const client = await pool.connect();
		const query = `SELECT id, nome, email FROM users WHERE apelido = $1`;
		try {
			const { rows } = await client.query(query, [apelido]);
			return rows[0];
		} catch (error) {
			throw new InternalServerException("Erro ao buscar usuário");
		} finally {
			client.release();
		}
	},

	findById: async (id) => {
		const client = await pool.connect();
		const query = `SELECT id, nome, email FROM users WHERE id = $1`;
		try {
			const { rows } = await client.query(query, [id]);
			return rows[0];
		} catch (error) {
			throw new InternalServerException("Erro ao buscar usuário");
		} finally {
			client.release();
		}
	},

	updateUserById: async (id, nome, email, senha) => {
		const client = await pool.connect();
		const setClause = [];
		const values = [];

		if (nome) {
			setClause.push(`nome = $${values.push(nome)}`);
		}
		if (email) {
			setClause.push(`email = $${values.push(email)}`);
		}
		if (senha) {
			setClause.push(`senha = $${values.push(senha)}`);
		}

		values.push(id);

		const query = `
          UPDATE users
          SET ${setClause.join(", ")}
          WHERE id = $${values.length}
          RETURNING id, nome, email`;
		try {
			const { rows } = await client.query(query, values);
			return rows[0];
		} catch (error) {
			throw new InternalServerException("Erro ao atualizar usuário");
		} finally {
			client.release();
		}
	},

	delete: async (id) => {
		const client = await pool.connect();
		const query = `DELETE FROM users WHERE id = $1 RETURNING id, nome, apelido ,email`;
		try {
			const { rows } = await client.query(query, [id]);
			return rows[0];
		} catch (error) {
			throw new InternalServerException("Erro ao deletar usuário");
		} finally {
			client.release();
		}
	},
};
