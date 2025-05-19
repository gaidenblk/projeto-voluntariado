(function () {
	// IIFE adicionado para evitar redeclaração de variavel na SPA

	const usuarioSalvo = localStorage.getItem("usuario");

	if (usuarioSalvo) {
		navegarPara("/home/");
		return;
	}

	document.getElementById("acesso").autofocus;

	document.querySelector("form").addEventListener("submit", (e) => {
		e.preventDefault();

		const acesso = document.getElementById("acesso").value;
		const senha = document.getElementById("senha").value;
		const btnLogin = document.getElementById("btnLogin");

		const data = {
			acesso: acesso,
			senha: senha,
		};

		fetch("/api/auth/login", {
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
				console.log("Login bem-sucedido:", result.user);
				btnLogin.disabled = true;
				popNotifica("Login efetuado com Sucesso!", result.success);
				setTimeout(() => {
					navegarPara("/home/");
				}, 3500);
			})
			.catch((error) => {
				console.error("Erro ao fazer login:", error.message);
			});
	});
})();
