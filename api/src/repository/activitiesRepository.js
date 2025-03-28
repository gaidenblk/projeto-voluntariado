import pool from "../database/index.js";
import { InternalServerException } from "../utils/exceptions.js";

export const activitiesRepository = {
	create: async (titulo, descricao, data, local) => {
		const client = await pool.connect();
		const query = `INSERT INTO activities (
		titulo, descricao, data, local)
		VALUES ($1, $2, $3, $4)
		RETURNING id, titulo, descricao, data, local`;
		try {
			const { rows } = await client.query(query, [titulo, descricao, data, local]);
			return rows[0];
		} catch (error) {
			throw new InternalServerException("Erro ao criar Atividade");
		} finally {
			client.release();
		}
	},

	update: async (id, titulo, descricao, data, local) => {
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

		values.push(id);

		const query = `
          UPDATE activities
          SET ${setClause.join(", ")}
          WHERE id = $${values.length}
          RETURNING id, titulo, descricao, data, local`;
		try {
			const { rows } = await client.query(query, values);
			return rows[0];
		} catch (error) {
			throw new InternalServerException("Erro ao atualizar Atividade");
		} finally {
			client.release();
		}
	},

	listAll: async () => {
		const client = await pool.connect();
		const query = `SELECT * FROM activities`;
		try {
			const { rows } = await client.query(query);
			return rows;
		} catch (error) {
			throw new InternalServerException("Erro ao Listar Todas as Atividades");
		} finally {
			client.release();
		}
	},

	listAllAvailable: async () => {
		const client = await pool.connect();
		const query = `SELECT * FROM activities WHERE data >= CURRENT_DATE`;
		try {
			const { rows } = await client.query(query);
			return rows;
		} catch (error) {
			throw new InternalServerException("Erro ao Listar Atividades");
		} finally {
			client.release();
		}
	},

	listAvailableById: async (atividade_id) => {
		const client = await pool.connect();
		const query = `SELECT * FROM activities WHERE id = $1 AND data >= CURRENT_DATE`;
		try {
			const { rows } = await client.query(query, [atividade_id]);
			return rows[0];
		} catch (error) {
			throw new InternalServerException("Erro ao Listar Atividades");
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
