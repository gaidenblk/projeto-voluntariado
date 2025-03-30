import { activitiesServices } from "../services/activitiesServices.js";
import { errorResponse } from "../utils/exceptions.js";

export const activitiesController = {
	createNewActivity: async (req, res) => {
		const { titulo, descricao, data, local } = req.body;

		if (!titulo || !descricao || !data || !local) {
			errorResponse(res, {
				error: "BAD_REQUEST",
				message: "Todos os Campos precisam estar preenchido!",
				statusCode: 400,
			});
			return;
		}

		if (isNaN(new Date(data).getTime())) {
			errorResponse(res, {
				error: "BAD_REQUEST",
				message: "Insira uma data válida!",
				statusCode: 400,
			});
			return;
		}
		try {
			const newActivity = await activitiesServices.createActivity(
				titulo,
				descricao,
				data,
				local,
			);
			res.status(201).json({
				sucess: true,
				message: "Atividade Criada com sucesso!",
				data: newActivity,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},
	updateActivity: async (req, res) => {
		const { titulo, descricao, data, local } = req.body;
		const id = req.params.atividade_id;

		if (isNaN(id)) {
			errorResponse(res, {
				error: "BAD_REQUEST",
				message: "Informe um ID válido da Atividade",
				statusCode: 400,
			});
			return;
		}

		if (!titulo && !descricao && !data && !local) {
			errorResponse(res, {
				error: "BAD_REQUEST",
				message: "Pelo menos um Campo precisa estar preenchido!",
				statusCode: 400,
			});
			return;
		}

		if (data) {
			if (isNaN(new Date(data).getTime())) {
				errorResponse(res, {
					error: "BAD_REQUEST",
					message: "Insira uma data válida!",
					statusCode: 400,
				});
				return;
			}
		}
		try {
			const updatedActivity = await activitiesServices.updateActivity(
				id,
				titulo,
				descricao,
				data,
				local,
			);
			res.status(200).json({
				sucess: true,
				message: "Atividade Atualizada com sucesso!",
				data: updatedActivity,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},

	listActivities: async (req, res) => {
		try {
			const activities = await activitiesServices.listAllWithUsers();
			res.status(200).json({
				sucess: true,
				message: "Listagem realizada com sucesso!",
				data: activities,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},

	listAvailableActivities: async (req, res) => {
		try {
			const activities = await activitiesServices.listAvailableActivities();
			res.status(200).json({
				sucess: true,
				message: "Listagem realizada com sucesso!",
				data: activities,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},

	listAll: async (req, res) => {
		try {
			const activities = await activitiesServices.listAllWithActivities();
			res.status(200).json({
				sucess: true,
				message: "Listagem realizada com sucesso!",
				data: activities,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},

	deleteActivity: async (req, res) => {
		const atividade_id = req.params.atividade_id;

		if (isNaN(atividade_id)) {
			errorResponse(res, {
				error: "BAD_REQUEST",
				message: "Informe um ID válido da atividade",
				statusCode: 400,
			});
			return;
		}

		try {
			const deletado = await activitiesServices.delete(atividade_id);
			res.status(200).json({
				sucess: true,
				message: "Atividade Deletada com sucesso",
				data: deletado,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},
};
