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

	listUser: async (actualUser) => {
		const existentUser = await userRepository.findById(actualUser.id);

		if (!existentUser) {
			throw new NotFoundException("Usuário não encontrado!");
		}

		return existentUser;
	},

	deleteUser: async (id, actualUser) => {
		const existentUser = await userRepository.findById(id);
		if (!existentUser) {
			throw new NotFoundException("Usuário não encontrado!");
		}
		if (actualUser.id !== existentUser.id) {
			throw new ForbiddenException("Não é possivel deletar o Coleguinha");
		}
		return await userRepository.delete(id);
	},

	subscribeToActivity: async (atividade_id, actualUser) => {
		const [existentUser, existentActivity] = await Promise.all([
			userRepository.findById(actualUser.id),
			activitiesRepository.listAvailableById(atividade_id),
		]);

		if (!existentUser) {
			throw new NotFoundException("Usuário não encontrado!");
		}

		if (!existentActivity) {
			throw new NotFoundException("Atividade não encontrada ou Indisponível!");
		}

		if (actualUser.id !== existentUser.id && actualUser.tipo !== "admin") {
			throw new ForbiddenException("Não é possível inscrever o Coleguinha");
		}

		return await userRepository.subscribeToActivity(existentUser.id, existentActivity.id);
	},

	listSubscribedActivities: async (usuario_id, actualUser) => {
		const existentUser = await userRepository.findById(usuario_id);

		if (!existentUser) {
			throw new NotFoundException("Usuário não encontrado!");
		}

		if (actualUser.id !== existentUser.id && actualUser.tipo !== "admin") {
			throw new ForbiddenException("Não é possível listar o Coleguinha");
		}

		const subscribedActivities = await userRepository.listSubscribedActivities(usuario_id);

		return {
			...existentUser,
			atividades:
				subscribedActivities.length > 0 ? subscribedActivities : "Não há atividades inscritas",
		};
	},

	unsubscribeToActivity: async (atividade_id, actualUser) => {
		const [existentUser, existentActivity, subscribedActivities] = await Promise.all([
			userRepository.findById(actualUser.id),
			activitiesRepository.listAvailableById(atividade_id),
			userRepository.listUserActivitiesById(actualUser.id),
		]);

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

		return await userRepository.unsubscribeToActivity(existentUser.id, existentActivity.id);
	},
};
