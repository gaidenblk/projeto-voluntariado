export function errorResponse(res, error) {
	const statusCode = error.statusCode || 500;
	const err = error.error || "INTERNAL_SERVER_ERROR";
	return res.status(statusCode).json({
		success: false,
		error: err,
		message: error.message,
	});
}

export class Exception extends Error {
	constructor(message, statusCode, error = "ERROR") {
		super(message);
		this.statusCode = statusCode;
		this.error = error;
	}
}

export class InternalServerException extends Exception {
	constructor(message) {
		super(message, 500, "INTERNAL_SERVER_ERROR");
	}
}

export class BadRequestException extends Exception {
	constructor(message) {
		super(message, 400, "BAD_REQUEST");
	}
}

export class UnauthorizedException extends Exception {
	constructor(message) {
		super(message, 401, "UNAUTHORIZED");
	}
}

export class NotFoundException extends Exception {
	constructor(message) {
		super(message, 404, "NOT_FOUND");
	}
}

export class ConflictException extends Exception {
	constructor(message) {
		super(message, 409, "CONFLICT");
	}
}

export class ForbiddenException extends Exception {
	constructor(message) {
		super(message, 403, "FORBIDDEN");
	}
}
