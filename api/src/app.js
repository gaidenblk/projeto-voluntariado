import express from "express";
import config from "./config/index.js";
import cookieParser from "cookie-parser";
import { routes } from "./routes/index.js";

const app = express();

const PORT = config.PORT;
const HOST = config.HOST;

app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

app.listen(PORT, HOST, () => {
	console.log(`Servidor Rodando em ${HOST} na porta ${PORT}`);
});
