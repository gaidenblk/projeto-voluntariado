import { activitiesRepository } from "../repository/activitiesRepository.js";
import { userRepository } from "../repository/usersRepository.js";
import {
	ConflictException,
	ForbiddenException,
	NotFoundException,
} from "../utils/exceptions.js";
import { hashPassword } from "../utils/passwords.js";

export const userServices = {
	createUser: async (nome, apelido, email, senha) => {
		const emailExistente = await userRepository.findByEmail(email);
		const apelidoExistente = await userRepository.findByUsername(apelido);

		if (emailExistente) {
			throw new ConflictException("Email do Usuário já Cadastrado!");
		}

		if (apelidoExistente) {
			throw new ConflictException("Apelido do Usuário já Cadastrado!");
		}

		const hashedPassword = await hashPassword(senha);
		return await userRepository.create(nome, apelido, email, hashedPassword);
	},

	updateUser: async (id, name, email, senha, tipo, actualUser) => {
		const existentEmail = await userRepository.findByEmail(email);
		const existentUser = await userRepository.findById(id);

		if (!existentUser) {
			throw new NotFoundException("Usuário não encontrado!");
		}

		if (existentEmail) {
			throw new ConflictException("Esse Email já Existe no Sistema");
		}

		if (actualUser.id !== existentUser.id && actualUser.tipo !== "admin") {
			throw new ForbiddenException("Não é possível alterar o Coleguinha");
		}

		if (tipo) {
			if (actualUser.tipo !== "admin") {
				throw new ForbiddenException("Sem permissão!");
			}
		}

		let hashedPassword;
		if (senha) {
			hashedPassword = await hashPassword(senha);
		}

		return await userRepository.updateUserById(id, name, email, hashedPassword, tipo);
	},

	findUserById: async (usuario_id, actualUser) => {
		const [existentUser, subscribedActivities] = await Promise.all([
			userRepository.findById(usuario_id),
			userRepository.listSubscribedActivities(usuario_id),
		]);

		if (!existentUser) {
			throw new NotFoundException("Usuário não encontrado!");
		}

		if (actualUser.id !== existentUser.id && actualUser.tipo !== "admin") {
			throw new ForbiddenException("Não é possível listar o Coleguinha");
		}

		return {
			...existentUser,
			total_atividades: subscribedActivities.length,
			atividades: subscribedActivities,
		};
	},

	listUser: async (usuario_id) => {
		const [existentUser, subscribedActivities] = await Promise.all([
			userRepository.findById(usuario_id),
			userRepository.listSubscribedActivities(usuario_id),
		]);

		if (!existentUser) {
			throw new NotFoundException("Usuário não encontrado!");
		}

		return {
			...existentUser,
			total_atividades: subscribedActivities.length,
			atividades: subscribedActivities,
		};
	},

	deleteUser: async (usuario_id, actualUser) => {
		const existentUser = await userRepository.findById(usuario_id);
		if (!existentUser) {
			throw new NotFoundException("Usuário não encontrado!");
		}

		if (actualUser.id !== existentUser.id && actualUser.tipo !== "admin") {
			throw new ForbiddenException("Não é possível deletar o Coleguinha");
		}

		return await userRepository.delete(usuario_id);
	},

	listActivities: async (page, limit) => {
		const activities = await activitiesRepository.listAllActivities(page, limit);

		if (activities.total === 0) {
			throw new NotFoundException("Não há Atividades!");
		}

		return activities;
	},

	subscribeToActivity: async (atividade_id, usuario_id, actualUser) => {
		const [existentUser, existentActivity, userActivity] = await Promise.all([
			userRepository.findById(usuario_id),
			activitiesRepository.findById(atividade_id),
			activitiesRepository.listUserActivitiesById(atividade_id),
		]);
		const today = new Date(Date.now());
		today.setHours(0, 0, 0, 0);

		if (!existentUser) {
			throw new NotFoundException("Usuário não encontrado!");
		}

		if (!existentActivity) {
			throw new NotFoundException("Atividade não encontrada!");
		}

		if (actualUser.id !== existentUser.id && actualUser.tipo !== "admin") {
			throw new ForbiddenException("Não é possível inscrever o Coleguinha");
		}

		// Verifica se o usuário está inscrito exatamente nessa atividade
		const isSubscribed = userActivity.some(
			(activity) => activity.usuario_id === Number(usuario_id),
		);

		if (isSubscribed) {
			throw new ConflictException("Usuário já está inscrito nesta atividade!");
		}

		if (existentActivity.vagas <= userActivity.length) {
			throw new ConflictException("Limite de inscrições atingido para esta atividade!");
		}

		if (existentActivity.data <= today) {
			throw new ConflictException("Prazo para inscrição na Atividade já expirou");
		}

		return await userRepository.subscribeToActivity(existentUser.id, existentActivity.id);
	},

	unsubscribeToActivity: async (atividade_id, usuario_id, actualUser) => {
		const [existentUser, existentActivity, subscribedActivities] = await Promise.all([
			userRepository.findById(usuario_id),
			activitiesRepository.findById(atividade_id),
			userRepository.listUserActivitiesById(usuario_id),
		]);
		const today = new Date(Date.now());
		today.setHours(0, 0, 0, 0);

		if (!existentUser) {
			throw new NotFoundException("Usuário não encontrado!");
		}

		if (!existentActivity) {
			throw new NotFoundException("Atividade não encontrada ou Indisponível!");
		}

		if (actualUser.id !== existentUser.id && actualUser.tipo !== "admin") {
			throw new ForbiddenException("Não é possível desinscrever o Coleguinha");
		}

		// Verifica se o usuário está inscrito exatamente nessa atividade
		const isSubscribed = subscribedActivities.some(
			(activity) => activity.atividade_id === Number(atividade_id),
		);

		if (!isSubscribed) {
			throw new ConflictException("Usuário não está inscrito nesta atividade!");
		}

		if (existentActivity.data <= today) {
			throw new ConflictException("Prazo para desinscrever da Atividade já expirou");
		}

		return await userRepository.unsubscribeToActivity(existentUser.id, existentActivity.id);
	},
};
