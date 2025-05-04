import { rateLimit } from "express-rate-limit";
import { errorResponse, TooManyRequestsException } from "../utils/exceptions.js";

export default rateLimit({
	windowMs: 1 * 60 * 1000,
	max: 50,
	handler: (req, res, next, options) => {
		const err = new TooManyRequestsException("Calma lá meu chefe, segura esses clicks ae...");
		return errorResponse(res, err);
	},
});
