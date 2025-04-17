import { BadRequestException, errorResponse, NotFoundException } from "../utils/exceptions.js";
import { authServices } from "../services/authServices.js";

export const authController = {
	authenticate: async (req, res) => {
		const { email, senha } = req.body;

		try {
			if (!req.body.email || !req.body.senha) {
				throw new BadRequestException("Email e senha são obrigatórios");
			}

			const { auth, token, user } = await authServices.authenticateUser(email, senha);

			res.cookie("session_id", token, {
				httpOnly: true,
				expires: new Date(Date.now() + 864000000),
			});
			res.status(200).json({ auth, user });
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
				auth: true,
				user: decoded,
				success: true,
				message: "Token valido!",
			});
		} catch (error) {
			errorResponse(res, error);
		}
	},
};
