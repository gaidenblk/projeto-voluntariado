import pool from "../database/index.js";
import { ConflictException, InternalServerException } from "../utils/exceptions.js";

export const userRepository = {
	create: async (nome, apelido, email, senha) => {
		const client = await pool.connect();
		const query = `INSERT INTO users (
		nome, apelido, email, senha)
		VALUES ($1, $2, $3, $4)
		RETURNING id, nome, apelido ,email`;
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
		const query = `SELECT id, nome, apelido, email, tipo, senha FROM users WHERE email = $1`;
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

	findById: async (usuario_id) => {
		const client = await pool.connect();
		const query = `SELECT id, nome, apelido FROM users WHERE id = $1`;
		try {
			const { rows } = await client.query(query, [usuario_id]);
			return rows[0];
		} catch (error) {
			throw new InternalServerException("Erro ao buscar usuário");
		} finally {
			client.release();
		}
	},

	listAll: async () => {
		const client = await pool.connect();
		const query = `SELECT id, nome, apelido, email FROM users`;
		try {
			const { rows } = await client.query(query);
			return rows;
		} catch (error) {
			throw new InternalServerException("Erro ao buscar Lista de Usuários");
		} finally {
			client.release();
		}
	},

	updateUserById: async (id, nome, email, senha, tipo) => {
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
		if (tipo) {
			setClause.push(`tipo = $${values.push(tipo)}`);
		}

		values.push(id);

		const query = `
          UPDATE users
          SET ${setClause.join(", ")}
          WHERE id = $${values.length}
          RETURNING id, nome, apelido, email, tipo`;
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

	subscribeToActivity: async (usuario_id, atividade_id) => {
		const client = await pool.connect();
		const query = `INSERT INTO user_activity (atividade_id, usuario_id) VALUES ($1, $2) RETURNING *`;

		try {
			const { rows } = await client.query(query, [atividade_id, usuario_id]);
			return rows[0];
		} catch (error) {
			if (error.code === "23505") {
				// Código do PostgreSQL para violação de chave única
				throw new ConflictException("Usuário já está inscrito nesta atividade!");
			}
			throw new InternalServerException("Erro ao inscrever usuário na atividade.");
		} finally {
			client.release();
		}
	},

	unsubscribeToActivity: async (usuario_id, atividade_id) => {
		const client = await pool.connect();
		const query = `DELETE FROM user_activity WHERE usuario_id = $1 AND atividade_id = $2 RETURNING *`;

		try {
			const { rows } = await client.query(query, [usuario_id, atividade_id]);

			return rows;
		} catch (error) {
			throw new InternalServerException("Erro ao remover inscrição do usuário na atividade.");
		} finally {
			client.release();
		}
	},

	listSubscribedActivities: async (usuario_id) => {
		const client = await pool.connect();
		const query = `
        SELECT a.id, a.titulo, a.descricao, a.data, a.local, a.created_at
        FROM user_activity ua
        JOIN activities a ON ua.atividade_id = a.id
        WHERE ua.usuario_id = $1
    `;
		try {
			const { rows } = await client.query(query, [usuario_id]);
			return rows;
		} catch (error) {
			throw new InternalServerException("Erro ao buscar atividades inscritas");
		} finally {
			client.release();
		}
	},

	listAllUserActivities: async () => {
		const client = await pool.connect();
		const query = `SELECT * FROM user_activity`;
		try {
			const { rows } = await client.query(query);
			return rows;
		} catch (error) {
			throw new InternalServerException("Erro ao Listar Usuários Inscritos nas Atividades");
		} finally {
			client.release();
		}
	},

	listUserActivitiesById: async (usuario_id) => {
		const client = await pool.connect();
		const query = `SELECT * FROM user_activity WHERE usuario_id = $1`;
		try {
			const { rows } = await client.query(query, [usuario_id]);
			return rows;
		} catch (error) {
			throw new InternalServerException("Erro ao Listar Usuários Inscritos nas Atividades");
		} finally {
			client.release();
		}
	},
};
