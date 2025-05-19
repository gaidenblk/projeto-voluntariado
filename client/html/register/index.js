document.getElementById("nome").autofocus;

document.querySelector("form").addEventListener("submit", (e) => {
	e.preventDefault();

	const nome = document.getElementById("nome").value;
	const apelido = document.getElementById("apelido").value;
	const email = document.getElementById("email").value;
	const senha = document.getElementById("senha").value;
	const btnCadastrar = document.getElementById("btnCadastrar");

	const data = {
		nome: nome,
		apelido: apelido,
		email: email,
		senha: senha,
	};

	console.log(data);

	fetch("/api/auth/register", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	})
		.then((response) => {
			if (!response.ok) {
				return response.json().then((err) => {
					popNotifica(err.message, err.success);
					throw new Error(err.message || `Erro ${response.status}`);
				});
			}
			return response.json();
		})
		.then((result) => {
			console.log("Cadastro efetuado com Sucesso!", result);
			btnCadastrar.disabled = true;
			popNotifica(result.message, result.success);
			setTimeout(() => {
				navegarPara("/login/");
			}, 3500);
		})
		.catch((error) => {
			console.error("Erro ao criar Cadastro:", error.message);
		});
});
