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

	listActivities: async () => {
		const [activities, userActivities] = await Promise.all([
			activitiesRepository.listAllActivities(),
			userRepository.listAllUserActivities(),
		]);

		if (activities.length === 0) {
			throw new NotFoundException("Não há Atividades!");
		}
		const allActivities = activities.map((activity) => {
			const inscritos = userActivities.filter(
				(userAct) => userAct.atividade_id === activity.id,
			);

			return {
				...activity,
				inscritos: inscritos.length,
			};
		});

		return allActivities;
	},

	listAllWithUsers: async () => {
		const [activities, users, userActivities] = await Promise.all([
			activitiesRepository.listAllActivities(),
			userRepository.listAllUsers(),
			userRepository.listAllUserActivities(),
		]);

		// Para cada atividade, adicionar um campo 'inscritos' com a lista de usuários inscritos
		const result = activities.map((activity) => {
			// Buscar os usuários inscritos na atividade com base na lista de user_activity
			const userActivitiesForActivity = userActivities.filter(
				(ua) => ua.atividade_id === activity.id,
			);

			// Montar a lista de usuários inscritos
			const usersForActivity = userActivitiesForActivity.map((ua) => {
				const user = users.find((u) => u.id === ua.usuario_id);
				return {
					id: user.id,
					nome: user.nome,
					apelido: user.apelido,
					email: user.email,
				};
			});

			// Retornar a atividade com os usuários inscritos
			return {
				...activity,
				inscritos: usersForActivity.length > 0 ? usersForActivity : "Nenhum inscrito",
			};
		});

		return result;
	},

	listUsersWithActivities: async () => {
		const [users, activities, userActivities] = await Promise.all([
			userRepository.listAllUsers(),
			activitiesRepository.listAllActivities(),
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
		const existentActivity = await activitiesRepository.findById(atividade_id);
		if (!existentActivity) {
			throw new NotFoundException("Atividade não encontrada!");
		}

		return await activitiesRepository.delete(atividade_id);
	},
};
