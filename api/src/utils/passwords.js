import bcrypt from "bcryptjs";

export const hashPassword = async (password) => {
	try {
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);
		return hash;
	} catch (error) {
		throw new Error("Password Hash Failed");
	}
};

export const comparePassword = async (password, hashedPassword) => {
	try {
		const result = await bcrypt.compare(password, hashedPassword);
		return result;
	} catch (error) {
		return false;
	}
};
