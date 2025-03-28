import { activitiesRepository } from "../repository/activitiesRepository.js";
import { userRepository } from "../repository/usersRepository.js";
import { BadRequestException, NotFoundException } from "../utils/exceptions.js";

export const activitiesServices = {
	createActivity: async (titulo, descricao, data, local) => {
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

		return await activitiesRepository.create(titulo, descricao, data, local);
	},

	updateActivity: async (id, titulo, descricao, data, local) => {
		if (titulo && titulo.length > 50) {
			throw new BadRequestException("Titulo não pode ser maior que 50 Caracteres");
		}
		if (local && local.length > 50) {
			throw new BadRequestException("Local não pode ser maior que 50 Caracteres");
		}

		if (data && new Date(data).getTime() < Date.now()) {
			throw new BadRequestException("Data precisa ser Maior que a data de Hoje");
		}
		return await activitiesRepository.update(id, titulo, descricao, data, local);
	},

	listActivities: async () => {
		return await activitiesRepository.listAll();
	},

	listAvailableActivities: async () => {
		const availableActivities = await activitiesRepository.listAllAvailable();
		if (availableActivities.length === 0) {
			throw new NotFoundException("Não há Atividades Disponiveis!");
		}
		return availableActivities;
	},

	listAllWithActivities: async () => {
		const [users, activities, userActivities] = await Promise.all([
			userRepository.listAll(),
			activitiesRepository.listAll(),
			userRepository.listAllUserActivities(),
		]);

		// Para cada usuário, adicionar um campo 'atividades' com as atividades inscritas
		const result = users.map((user) => {
			// Buscar as atividades do usuário com base na lista de user_activity
			const userActivitiesForUser = userActivities.filter((ua) => ua.usuario_id === user.id);

			// Montar as atividades desse usuário, mapeando para os dados da atividade
			const activitiesForUser = userActivitiesForUser.map((ua) => {
				const activity = activities.find((a) => a.id === ua.atividade_id);
				return {
					id: activity.id,
					titulo: activity.titulo,
					descricao: activity.descricao,
					data: activity.data,
					local: activity.local,
					created_at: activity.created_at,
				};
			});

			// Retornar o usuário com as atividades
			return {
				...user,
				atividades:
					activitiesForUser.length > 0 ? activitiesForUser : "Não há atividades inscritas",
			};
		});

		return result;
	},

	delete: async (atividade_id) => {
		const existentActivity = await activitiesRepository.listAll(atividade_id);
		if (!existentActivity) {
			throw new NotFoundException("Atividade não encontrada!");
		}
		return await activitiesRepository.delete(atividade_id);
	},
};
