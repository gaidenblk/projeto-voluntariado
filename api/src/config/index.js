import dotenv from "dotenv";

dotenv.config();

const config = {
	PORT: process.env.PORT || 5000,
	HOST: process.env.HOST || "localhost",
	DATABASE_URL: process.env.DATABASE_URL,
};

export default config;
