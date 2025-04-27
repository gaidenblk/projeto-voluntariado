import dotenv from "dotenv";

dotenv.config();

const config = {
	PORT: process.env.PORT || 5000,
	DB_PORT: process.env.DB_PORT || 5454,
	HOST: process.env.HOST || "localhost",
	DB_HOST: process.env.DB_HOST || "localhost",
	SECRET_KEY: process.env.SECRET_KEY,
	POSTGRES_USER: process.env.POSTGRES_USER,
	POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
	POSTGRES_DB: process.env.POSTGRES_DB,
	SENHA_ADMIN: process.env.SENHA_ADMIN,
};

export default config;
