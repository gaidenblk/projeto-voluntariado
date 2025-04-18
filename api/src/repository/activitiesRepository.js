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

	listAllActivities: async () => {
		const client = await pool.connect();
		const query = `SELECT id, titulo, descricao, data, local, vagas FROM activities`;
		try {
			const { rows } = await client.query(query);
			return rows;
		} catch (error) {
			throw new InternalServerException("Erro ao Listar Todas as Atividades");
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
};
