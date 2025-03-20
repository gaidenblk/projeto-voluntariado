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

	updateUser: async (id, name, email, senha, actualUser) => {
		const existentEmail = await userRepository.findByEmail(email);
		const existentUser = await userRepository.findById(id);

		if (!existentUser) {
			throw new NotFoundException("Usuário não encontrado!");
		}

		if (existentEmail) {
			throw new ConflictException("Esse Email já Existe no Sistema");
		}

		if (actualUser.id !== existentUser.id) {
			throw new ForbiddenException("Não é possivel alterar o Coleguinha");
		}

		let hashedPassword;
		if (senha) {
			hashedPassword = await hashPassword(senha);
		}

		return await userRepository.updateUserById(id, name, email, hashedPassword);
	},

	deleteUser: async (id, actualUser) => {
		const existentUser = await userRepository.findById(id);
		if (!existentUser) {
			throw new NotFoundException("Usuário não encontrado!");
		}
		if (actualUser.id !== existentUser.id) {
			throw new ForbiddenException("Não é possivel deletar o Coleguinha");
		}
		const deletado = await userRepository.delete(id);
		return deletado;
	},
};
