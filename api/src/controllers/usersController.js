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

		if (apelido === "admin") {
			errorResponse(res, {
				error: "BAD_REQUEST",
				message: "Apelido não pode ser admin, escolha outro...",
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

	listUser: async (req, res) => {
		const actualUser = req?.user;

		try {
			const user = await userServices.listUser(actualUser);

			res.status(200).json({
				sucess: true,
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

		if (tipo) {
			if (!["admin", "usuario"].includes(tipo)) {
				errorResponse(res, {
					error: "BAD_REQUEST",
					message: "O tipo deve ser 'admin' ou 'usuario'.",
					statusCode: 400,
				});
				return;
			}
		}

		try {
			const updatedUser = await userServices.updateUser(
				usuario_id,
				nome,
				email,
				senha,
				tipo,
				actualUser,
			);

			res.status(200).json({
				sucess: true,
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

		if (isNaN(id)) {
			errorResponse(res, {
				error: "BAD_REQUEST",
				message: "Informe um ID válido do usuário",
				statusCode: 400,
			});
			return;
		}

		try {
			const deletado = await userServices.deleteUser(usuario_id, actualUser);
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

	subscribeToActivity: async (req, res) => {
		const atividade_id = req.params.atividade_id;
		const usuario_id = req.params.usuario_id;
		const actualUser = req?.user;

		if (isNaN(atividade_id)) {
			errorResponse(res, {
				error: "BAD_REQUEST",
				message: "Informe um ID válido de Atividade",
				statusCode: 400,
			});
			return;
		}

		try {
			const subscribe = await userServices.subscribeToActivity(
				atividade_id,
				usuario_id,
				actualUser,
			);
			res.status(200).json({
				sucess: true,
				message: "Usuário Inscrito com sucesso na atividade",
				data: subscribe,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},

	listSubscribedActivities: async (req, res) => {
		const usuario_id = req.params.usuario_id;
		const actualUser = req?.user;

		if (isNaN(usuario_id)) {
			errorResponse(res, {
				error: "BAD_REQUEST",
				message: "Informe um ID válido de Usuário",
				statusCode: 400,
			});
			return;
		}

		try {
			const subscribedList = await userServices.listSubscribedActivities(
				usuario_id,
				actualUser,
			);
			res.status(200).json({
				sucess: true,
				message: "Busca realizada com Sucesso!",
				data: subscribedList,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},

	unsubscribeActivity: async (req, res) => {
		const atividade_id = req.params.atividade_id;
		const usuario_id = req.params.usuario_id;
		const actualUser = req?.user;

		if (isNaN(atividade_id)) {
			errorResponse(res, {
				error: "BAD_REQUEST",
				message: "Informe um ID válido de Atividade",
				statusCode: 400,
			});
			return;
		}

		try {
			const unsubscribe = await userServices.unsubscribeToActivity(
				atividade_id,
				usuario_id,
				actualUser,
			);
			res.status(200).json({
				sucess: true,
				message: "Usuário Removido com sucesso da atividade",
				data: unsubscribe,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},
};
