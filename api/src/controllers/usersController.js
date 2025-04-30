import { BadRequestException, errorResponse } from "../utils/exceptions.js";
import { userServices } from "../services/usersServices.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const userController = {
	createNewUser: async (req, res) => {
		const { nome, apelido, email, senha } = req.body;

		try {
			if (!nome) {
				throw new BadRequestException("Nome é obrigatório");
			}

			if (!apelido) {
				throw new BadRequestException("Apelido é obrigatório");
			}

			if (apelido === "admin") {
				throw new BadRequestException("Apelido não pode ser admin, escolha outro...");
			}

			if (!email) {
				throw new BadRequestException("Email é obrigatório");
			}

			if (email === "admin@email.com") {
				throw new BadRequestException("Email não pode ser esse, escolha outro...");
			}

			if (!senha) {
				throw new BadRequestException("Senha é obrigatória");
			}

			if (!emailRegex.test(email)) {
				throw new BadRequestException("Email inválido");
			}

			if (senha.length < 6) {
				throw new BadRequestException("Senha deve ter no mínimo 6 caracteres");
			}

			const newUser = await userServices.createUser(nome, apelido, email, senha);

			res.status(200).json({
				success: true,
				message: "Usuário criado com sucesso",
				data: newUser,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},

	findUserById: async (req, res) => {
		const actualUser = req?.user;
		const usuario_id = req.params.usuario_id;

		try {
			const user = await userServices.findUserById(usuario_id, actualUser);

			res.status(200).json({
				success: true,
				message: "Usuário Listado com sucesso",
				data: user,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},

	listUser: async (req, res) => {
		const actualUser = req?.user;

		try {
			const user = await userServices.listUser(actualUser.id);

			res.status(200).json({
				success: true,
				message: "Usuário Listado com sucesso",
				data: user,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},

	updateExistentUser: async (req, res) => {
		const usuario_id = req.params.usuario_id;
		const actualUser = req?.user;
		const { nome, email, senha, tipo } = req.body;

		try {
			if (email) {
				if (!emailRegex.test(email)) {
					throw new BadRequestException("Email inválido");
				}
			}

			if (senha) {
				if (senha.length < 6) {
					throw new BadRequestException("Senha deve ter no mínimo 6 caracteres");
				}
			}

			if (tipo) {
				if (!["admin", "usuario"].includes(tipo)) {
					throw new BadRequestException("O tipo deve ser 'admin' ou 'usuario'.");
				}
			}

			const updatedUser = await userServices.updateUser(
				usuario_id,
				nome,
				email,
				senha,
				tipo,
				actualUser,
			);

			res.status(200).json({
				success: true,
				message: "Usuário Atualizado com sucesso",
				data: updatedUser,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},

	deleteExistentUser: async (req, res) => {
		const usuario_id = req.params.usuario_id;
		const actualUser = req?.user;

		try {
			if (isNaN(usuario_id)) {
				throw new BadRequestException("Informe um ID válido do usuário");
			}

			const deletado = await userServices.deleteUser(usuario_id, actualUser);
			res.clearCookie("session_id");
			res.status(200).json({
				success: true,
				message: "Usuário Deletado com sucesso",
				data: deletado,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},

	listActivities: async (req, res) => {
		const { page, limit } = req.query;
		const actualUser = req?.user.id;
		try {
			const activities = await userServices.listActivities(page, limit, actualUser);
			res.status(200).json({
				success: true,
				message: "Listagem realizada com sucesso!",
				data: activities,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},

	subscribeToActivity: async (req, res) => {
		const { atividade_id, usuario_id } = req.params;
		const actualUser = req?.user;

		try {
			if (isNaN(atividade_id)) {
				throw new BadRequestException("Informe um ID válido de Atividade");
			}

			const subscribe = await userServices.subscribeToActivity(
				atividade_id,
				usuario_id,
				actualUser,
			);

			res.status(200).json({
				success: true,
				message: "Usuário Inscrito com sucesso na atividade",
				data: subscribe,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},

	unsubscribeActivity: async (req, res) => {
		const { atividade_id, usuario_id } = req.params;
		const actualUser = req?.user;

		try {
			if (isNaN(atividade_id)) {
				throw new BadRequestException("Informe um ID válido de Atividade");
			}

			const unsubscribe = await userServices.unsubscribeToActivity(
				atividade_id,
				usuario_id,
				actualUser,
			);

			res.status(200).json({
				success: true,
				message: "Usuário Removido com sucesso da atividade",
				data: unsubscribe,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},
};
