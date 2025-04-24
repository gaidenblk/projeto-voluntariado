import { BadRequestException, errorResponse, NotFoundException } from "../utils/exceptions.js";
import { authServices } from "../services/authServices.js";

export const authController = {
	authenticate: async (req, res) => {
		const { acesso, senha } = req.body;

		try {
			if (!acesso || !senha) {
				throw new BadRequestException("Dados de acesso são obrigatórios");
			}

			const { auth, token, user } = await authServices.authenticateUser(acesso, senha);

			res.cookie("session_id", token, {
				httpOnly: true,
				expires: new Date(Date.now() + 864000000),
			});
			res
				.status(200)
				.json({ success: auth, message: "Login efetuado com sucesso!", user: user });
			return;
		} catch (error) {
			errorResponse(res, error);
		}
	},

	logout: async (req, res) => {
		try {
			res.clearCookie("session_id");
			res.status(200).json({
				success: true,
				message: "Sua conta foi desconectada com sucesso!",
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},

	validateToken: async (req, res) => {
		const token = req.cookies?.session_id;

		try {
			if (!token) {
				throw new NotFoundException("Token não encontrado!");
			}

			const decoded = await authServices.validateUser(token);

			res.status(200).json({
				success: true,
				message: "Token valido!",
				user: decoded,
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},
};
