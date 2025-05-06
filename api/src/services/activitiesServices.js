import { activitiesRepository } from "../repository/activitiesRepository.js";
import { userRepository } from "../repository/usersRepository.js";
import { BadRequestException, NotFoundException } from "../utils/exceptions.js";

export const activitiesServices = {
	createActivity: async (titulo, descricao, data, local, vagas) => {
		const today = new Date(Date.now());
		today.setHours(0, 0, 0, 0);

		const inputDate = new Date(data);

		if (inputDate <= today) {
			throw new BadRequestException("Data precisa ser maior que a data de Hoje");
		}
		if (titulo.length > 50) {
			throw new BadRequestException("Titulo não pode ser maior que 50 Caracteres");
		}
		if (local.length > 50) {
			throw new BadRequestException("Local não pode ser maior que 50 Caracteres");
		}
		if (vagas > 25) {
			throw new BadRequestException("Quantidade de vagas não pode ser maior que 25");
		}

		return await activitiesRepository.create(titulo, descricao, data, local, vagas);
	},

	updateActivity: async (atividade_id, titulo, descricao, data, local, vagas) => {
		const [existentActivity, userActivities] = await Promise.all([
			activitiesRepository.findById(atividade_id),
			activitiesRepository.listUserActivitiesById(atividade_id),
		]);
		const today = new Date(Date.now());
		today.setHours(0, 0, 0, 0);

		if (!existentActivity) {
			throw new NotFoundException("Atividade não encontrada!");
		}
		if (titulo && titulo.length > 50) {
			throw new BadRequestException("Titulo não pode ser maior que 50 Caracteres");
		}
		if (local && local.length > 50) {
			throw new BadRequestException("Local não pode ser maior que 50 Caracteres");
		}
		if (data && new Date(data).getTime() < today) {
			throw new BadRequestException("Data precisa ser Maior que a data de Hoje");
		}
		if (vagas > 25) {
			throw new BadRequestException("Quantidade de vagas não pode ser maior que 25");
		}
		if (vagas < userActivities.length) {
			throw new BadRequestException(
				"Quantidade de vagas não pode ser menor que quantidade de Inscritos",
			);
		}

		return await activitiesRepository.update(
			atividade_id,
			titulo,
			descricao,
			data,
			local,
			vagas,
		);
	},

	listAllWithUsers: async (page, limit, usuario_id) => {
		const activities = await activitiesRepository.listAllWithUsers(page, limit, usuario_id);

		if (activities.total === 0) {
			throw new NotFoundException("Não há Atividades!");
		}
		return activities;
	},

	listUsersWithActivities: async (page, limit) => {
		const users = await activitiesRepository.listUsersWithActivities(page, limit);

		if (users.total === 0) {
			throw new NotFoundException("Não há Usuários");
		}
		return users;
	},

	delete: async (atividade_id) => {
		const existentActivity = await activitiesRepository.findById(atividade_id);
		if (!existentActivity) {
			throw new NotFoundException("Atividade não encontrada!");
		}

		return await activitiesRepository.delete(atividade_id);
	},
};
