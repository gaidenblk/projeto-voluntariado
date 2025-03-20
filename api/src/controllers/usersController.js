import { errorResponse } from "../utils/exceptions.js";
import { userServices } from "../services/usersServices.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const userController = {
	createNewUser: async (req, res) => {
		const { nome, apelido, email, senha } = req.body;

		if (!nome) {
			errorResponse(res, {
				error: "BAD_REQUEST",
				message: "Nome é obrigatório",
				statusCode: 400,
			});
			return;
		}

		if (!apelido) {
			errorResponse(res, {
				error: "BAD_REQUEST",
				message: "Apelido é obrigatório",
				statusCode: 400,
			});
			return;
		}

		if (!email) {
			errorResponse(res, {
				error: "BAD_REQUEST",
				message: "Email é obrigatório",
				statusCode: 400,
			});
			return;
		}

		if (!senha) {
			errorResponse(res, {
				error: "BAD_REQUEST",
				message: "Senha é obrigatória",
				statusCode: 400,
			});
			return;
		}

		if (!emailRegex.test(email)) {
			errorResponse(res, {
				error: "BAD_REQUEST",
				message: "Email inválido",
				statusCode: 400,
			});
			return;
		}

		if (senha.length < 6) {
			errorResponse(res, {
				error: "BAD_REQUEST",
				message: "Senha deve ter no mínimo 6 caracteres",
				statusCode: 400,
			});
			return;
		}

		try {
			const newUser = await userServices.createUser(nome, apelido, email, senha);

			res.status(200).json({
				sucess: true,
				message: "Usuário criado com sucesso",
				data: newUser,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},

	updateExistentUser: async (req, res) => {
		const id = req.params.id;
		const actualUser = req?.user;
		const { nome, email, senha } = req.body;

		if (email) {
			if (!emailRegex.test(email)) {
				errorResponse(res, {
					error: "BAD_REQUEST",
					message: "Email inválido",
					statusCode: 400,
				});
				return;
			}
		}

		if (senha) {
			if (senha.length < 6) {
				errorResponse(res, {
					error: "BAD_REQUEST",
					message: "Senha deve ter no mínimo 6 caracteres",
					statusCode: 400,
				});
				return;
			}
		}

		try {
			const newUser = await userServices.updateUser(id, nome, email, senha, actualUser);

			res.status(200).json({
				sucess: true,
				message: "Usuário Atualizado com sucesso",
				data: newUser,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},

	deleteExistentUser: async (req, res) => {
		const id = req.params.id;
		const actualUser = req?.user;
		try {
			const deletado = await userServices.deleteUser(id, actualUser);
			res.clearCookie("session_id");
			res.status(200).json({
				sucess: true,
				message: "Usuário Deletado com sucesso",
				data: deletado,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},
};
