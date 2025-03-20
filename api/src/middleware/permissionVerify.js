import jwt from "jsonwebtoken";
import config from "../config/index.js";
import {
	errorResponse,
	ForbiddenException,
	UnauthorizedException,
} from "../utils/exceptions.js";

export const permissionVerify = (req, res, next) => {
	try {
		const sessionToken = req.cookies.session_id;

		if (!sessionToken) {
			throw new ForbiddenException("Sem Token");
		}

		jwt.verify(sessionToken, config.SECRET_KEY, (error, decoded) => {
			if (error) {
				// O erro precisa ser tratado dentro do callback
				return errorResponse(res, new UnauthorizedException("Token JWT Inválido"));
			}

			req.user = decoded;
			next();
		});
	} catch (error) {
		errorResponse(res, error);
	}
};
