import jwt from "jsonwebtoken";
import config from "../config/index.js";
import { comparePassword } from "../utils/passwords.js";
import { userRepository } from "../repository/usersRepository.js";
import {
	BadRequestException,
	InternalServerException,
	NotFoundException,
} from "../utils/exceptions.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authServices = {
	getUser: async (email) => {
		if (!emailRegex.test(email)) {
			throw new BadRequestException("Email inválido");
		}
		const user = await userRepository.findByEmail(email);

		if (!user) throw new NotFoundException("Usuário não encontrado");

		return user;
	},

	authenticateUser: async (email, senha) => {
		const user = await userRepository.findByEmail(email);

		if (!user) {
			throw new NotFoundException("Usuário não encontrado");
		}
		if (!(await comparePassword(senha, user?.senha))) {
			throw new BadRequestException("Senha Incorreta!");
		}

		try {
			const token = jwt.sign({ id: user.id, email: user.email }, config.SECRET_KEY, {
				expiresIn: 864000,
			});
			return {
				auth: true,
				token: token,
				user: { id: user.id, email: user.email },
			};
		} catch (error) {
			throw new InternalServerException("Erro ao Autenticar Usuário");
		}
	},

	validateUser: async (token) => {
		const decoded = jwt.verify(token, config.SECRET_KEY);
		return decoded;
	},
};
