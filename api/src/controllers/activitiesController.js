import { activitiesServices } from "../services/activitiesServices.js";
import { BadRequestException, errorResponse } from "../utils/exceptions.js";

export const activitiesController = {
	createNewActivity: async (req, res) => {
		const { titulo, descricao, data, local, vagas } = req.body;

		try {
			if (!titulo || !descricao || !data || !local || !vagas) {
				throw new BadRequestException("Todos os Campos precisam estar preenchidos!");
			}

			if (isNaN(new Date(data).getTime())) {
				throw new BadRequestException("Insira uma data válida!");
			}

			if (isNaN(Number(vagas))) {
				throw new BadRequestException("Insira um numero de vagas válido!");
			}

			if (Number(vagas) <= 0) {
				throw new BadRequestException("Quantidade mínima de vagas é 1!");
			}

			const newActivity = await activitiesServices.createActivity(
				titulo,
				descricao,
				data,
				local,
				vagas,
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
		const { titulo, descricao, data, local, vagas } = req.body;
		const atividade_id = req.params.atividade_id;

		try {
			if (isNaN(atividade_id)) {
				throw new BadRequestException("Informe um ID válido da Atividade");
			}

			if (!titulo && !descricao && !data && !local) {
				throw new BadRequestException("Pelo menos um Campo precisa estar preenchido!");
			}

			if (data) {
				if (isNaN(new Date(data).getTime())) {
					throw new BadRequestException("Insira uma data válida!");
				}
			}

			if (vagas) {
				if (isNaN(Number(vagas))) {
					throw new BadRequestException("Insira um numero de vagas válido!");
				}

				if (Number(vagas) <= 0) {
					throw new BadRequestException("Quantidade mínima de vagas é 1!");
				}
			}

			const updatedActivity = await activitiesServices.updateActivity(
				atividade_id,
				titulo,
				descricao,
				data,
				local,
				vagas,
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

	listAllWithUsers: async (req, res) => {
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

	listUsersWithActivities: async (req, res) => {
		try {
			const activities = await activitiesServices.listUsersWithActivities();
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

		try {
			if (isNaN(atividade_id)) {
				throw new BadRequestException("Informe um ID válido da atividade");
			}

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
