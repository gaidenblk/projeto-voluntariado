import pool from "../database/index.js";
import { InternalServerException } from "../utils/exceptions.js";

export const activitiesRepository = {
	create: async (titulo, descricao, data, local, vagas) => {
		const client = await pool.connect();
		const query = `INSERT INTO activities (
		titulo, descricao, data, local, vagas)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, titulo, descricao, data, local, vagas`;

		try {
			const { rows } = await client.query(query, [titulo, descricao, data, local, vagas]);
			return rows[0];
		} catch (error) {
			throw new InternalServerException("Erro ao criar Atividade");
		} finally {
			client.release();
		}
	},

	update: async (atividade_id, titulo, descricao, data, local, vagas) => {
		const client = await pool.connect();
		const setClause = [];
		const values = [];

		if (titulo) {
			setClause.push(`titulo = $${values.push(titulo)}`);
		}
		if (descricao) {
			setClause.push(`descricao = $${values.push(descricao)}`);
		}
		if (data) {
			setClause.push(`data = $${values.push(data)}`);
		}
		if (local) {
			setClause.push(`local = $${values.push(local)}`);
		}
		if (vagas) {
			setClause.push(`vagas = $${values.push(vagas)}`);
		}

		values.push(atividade_id);

		const query = `
          UPDATE activities
          SET ${setClause.join(", ")}
          WHERE id = $${values.length}
          RETURNING id, titulo, descricao, data, local, vagas`;
		try {
			const { rows } = await client.query(query, values);
			return rows[0];
		} catch (error) {
			throw new InternalServerException("Erro ao atualizar Atividade");
		} finally {
			client.release();
		}
	},

	findById: async (atividade_id) => {
		const client = await pool.connect();
		const query = `SELECT id, titulo, descricao, data, local, vagas FROM activities WHERE id = $1;`;
		try {
			const { rows } = await client.query(query, [atividade_id]);
			return rows[0] || null;
		} catch (error) {
			throw new InternalServerException("Erro ao Listar Atividade");
		} finally {
			client.release();
		}
	},

	listUserActivitiesById: async (atividade_id) => {
		const client = await pool.connect();
		const query = `SELECT * FROM user_activity WHERE atividade_id = $1`;
		try {
			const { rows } = await client.query(query, [atividade_id]);
			return rows;
		} catch (error) {
			throw new InternalServerException("Erro ao Listar Atividades com Inscritos");
		} finally {
			client.release();
		}
	},

	listAllActivities: async (page = 1, perPage = 10, usuario_id) => {
		const client = await pool.connect();
		const offset = (page - 1) * perPage;
		const query = `
			SELECT
				a.id,
				a.titulo,
				a.descricao,
				a.data,
				a.local,
				a.vagas,
				COUNT(ua.usuario_id) AS total_inscritos,
				EXISTS (
					SELECT 1 FROM user_activity
					WHERE usuario_id = $3 AND atividade_id = a.id
				) AS inscrito
			FROM activities a
			LEFT JOIN user_activity ua ON a.id = ua.atividade_id
			GROUP BY a.id
			ORDER BY a.data DESC
			LIMIT $1 OFFSET $2
		`;

		const queryCount = `SELECT COUNT(*) AS total FROM activities`;

		try {
			const [dataResult, countResult] = await Promise.all([
				client.query(query, [perPage, offset, usuario_id]),
				client.query(queryCount),
			]);

			return {
				total: parseInt(countResult.rows[0].total, 10),
				pagina: parseInt(page),
				limite: parseInt(perPage),
				atividades: dataResult.rows.map((a) => ({
					...a,
					total_inscritos: parseInt(a.total_inscritos, 10),
					inscrito: a.inscrito,
				})),
			};
		} catch (error) {
			throw new InternalServerException("Erro ao listar atividades com contagem de inscritos");
		} finally {
			client.release();
		}
	},

	listAllWithUsers: async (page = 1, perPage = 10) => {
		const client = await pool.connect();
		const offset = (page - 1) * perPage;

		const query = `
			SELECT
				a.id,
				a.titulo,
				a.descricao,
				a.data,
				a.local,
				a.vagas,
				COUNT(u.id) AS total_inscritos,
				COALESCE(
					JSON_AGG(
						JSON_BUILD_OBJECT(
							'id', u.id,
							'nome', u.nome,
							'apelido', u.apelido,
							'email', u.email
						)
					) FILTER (WHERE u.id IS NOT NULL),
					'[]'
				) AS inscritos
			FROM activities a
			LEFT JOIN user_activity ua ON a.id = ua.atividade_id
			LEFT JOIN users u ON u.id = ua.usuario_id
			GROUP BY a.id
			ORDER BY a.data DESC
			LIMIT $1 OFFSET $2;
		`;

		const queryCount = `SELECT COUNT(*) AS total FROM activities;`;

		try {
			const [dataResult, countResult] = await Promise.all([
				client.query(query, [perPage, offset]),
				client.query(queryCount),
			]);

			return {
				total: parseInt(countResult.rows[0].total, 10),
				pagina: parseInt(page),
				limite: parseInt(perPage),
				atividades: dataResult.rows.map((atividade) => ({
					...atividade,
					total_inscritos: parseInt(atividade.total_inscritos, 10),
				})),
			};
		} catch (error) {
			throw new InternalServerException("Erro ao listar atividades com usuários");
		} finally {
			client.release();
		}
	},

	listUsersWithActivities: async (page = 1, perPage = 10) => {
		const client = await pool.connect();
		const offset = (page - 1) * perPage;

		const query = `
			SELECT
				u.id,
				u.nome,
				u.apelido,
				u.email,
				COUNT(a.id) AS total_atividades,
				COALESCE(
					JSON_AGG(
						JSON_BUILD_OBJECT(
							'id', a.id,
							'titulo', a.titulo,
							'descricao', a.descricao,
							'data', a.data,
							'local', a.local
						)
					) FILTER (WHERE a.id IS NOT NULL),
					'[]'
				) AS atividades
			FROM users u
			LEFT JOIN user_activity ua ON u.id = ua.usuario_id
			LEFT JOIN activities a ON a.id = ua.atividade_id
			GROUP BY u.id
			ORDER BY u.nome
			LIMIT $1 OFFSET $2;
		`;

		const queryCount = `SELECT COUNT(*) AS total FROM users;`;

		try {
			const [dataResult, countResult] = await Promise.all([
				client.query(query, [perPage, offset]),
				client.query(queryCount),
			]);

			return {
				total: parseInt(countResult.rows[0].total, 10),
				pagina: parseInt(page),
				limite: parseInt(perPage),
				usuarios: dataResult.rows.map((user) => ({
					...user,
					total_atividades: parseInt(user.total_atividades, 10),
				})),
			};
		} catch (error) {
			throw new InternalServerException("Erro ao listar usuários com atividades");
		} finally {
			client.release();
		}
	},

	delete: async (atividade_id) => {
		const client = await pool.connect();
		const query = `DELETE FROM activities WHERE id = $1 RETURNING *`;
		try {
			const { rows } = await client.query(query, [atividade_id]);
			return rows[0];
		} catch (error) {
			throw new InternalServerException("Erro ao deletar atividade!");
		} finally {
			client.release();
		}
	},
};
