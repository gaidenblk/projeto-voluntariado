(async function () {
	// IIFE adicionado para evitar redeclaração de variavel na SPA

	let paginaAtual = 1;
	let totalPaginas = 1;
	let usuarioLogado;

	const usuarioNome = document.querySelector("#usuarioNome");
	const atividadeContainer = document.querySelector("#atividadeContainer");
	const btnLogout = document.querySelector("#btnLogout");
	const selLimite = document.querySelector("#selLimite");
	const btnAnterior = document.querySelector("#btnAnterior");
	const btnProxima = document.querySelector("#btnProxima");

	async function validaToken() {
		return fetch("/api/auth/validate", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((response) => {
				if (!response.ok) {
					return response.json().then((err) => {
						popNotifica(err.message, err.success);
						localStorage.removeItem("usuario");
						setTimeout(() => {
							navegarPara("/");
						}, 3500);
						throw new Error(err.message || `Erro ${response.status}`);
					});
				}
				return response.json();
			})
			.then((result) => {
				return result.user;
			});
	}

	async function carregarUsuario(apelido) {
		const usuarioSalvo = localStorage.getItem("usuario");

		if (usuarioSalvo) {
			const usuario = await JSON.parse(usuarioSalvo);
			if (usuario.apelido === apelido) {
				usuarioLogado = usuario;
				return usuario;
			}
		} else {
			return fetch("/api/user", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
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
					usuarioLogado = result.data;
					localStorage.setItem("usuario", JSON.stringify(result.data));
					return result.data;
				});
		}
	}

	function cardCriarAtividade(usuarioLogado) {
		if (usuarioLogado.tipo !== "admin") return null;

		const wrapper = document.createElement("div");
		wrapper.classList.add("card-criar-wrapper");

		const btnCriarAtividade = document.createElement("button");
		btnCriarAtividade.classList.add("btn-criar-atividade");
		btnCriarAtividade.textContent = "+ Criar Atividade";

		wrapper.appendChild(btnCriarAtividade);

		btnCriarAtividade.addEventListener("click", () => {
			const modal = divModal("criar", true);

			// Inputs do formulário
			const inptTitulo = modal.querySelector(".inpt-titulo");
			const textareaDescricao = modal.querySelector(".inpt-descricao");
			const inptLocal = modal.querySelector(".inpt-local");
			const inptData = modal.querySelector(".inpt-data");
			const inptQtdVagas = modal.querySelector(".inpt-qtd-vagas");

			// Botões do formulário
			const btnModalSalvar = modal.querySelector(".btn-salvar");
			const btnModalCancelar = modal.querySelector(".btn-cancelar");

			btnModalSalvar.addEventListener("click", () => {
				btnModalSalvar.disabled = true;
				btnModalSalvar.style.cursor = "not-allowed";

				// Captura dos valores dos inputs
				const atividadeBody = {
					titulo: inptTitulo.value.trim(),
					descricao: textareaDescricao.value.trim(),
					local: inptLocal.value.trim(),
					data: inptData.value,
					vagas: inptQtdVagas.value,
				};

				// Validação simples
				if (
					!atividadeBody.titulo ||
					!atividadeBody.descricao ||
					!atividadeBody.local ||
					!atividadeBody.data ||
					!atividadeBody.vagas
				) {
					popNotifica("Preencha todos os campos!", false);
					setTimeout(() => {
						btnModalSalvar.disabled = false;
						btnModalSalvar.style.cursor = "pointer";
					}, 2000);
					return;
				}

				fetch("/api/activities/create", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(atividadeBody),
				})
					.then((response) => {
						if (!response.ok) {
							return response.json().then((err) => {
								popNotifica(err.message, err.success);
								setTimeout(() => {
									btnModalSalvar.disabled = false;
									btnModalSalvar.style.cursor = "pointer";
								}, 2000);
								throw new Error(err.message || `Erro ${response.status}`);
							});
						}
						return response.json();
					})
					.then((result) => {
						popNotifica(result.message, result.success);

						const novaAtividade = {
							...result.data,
							inscrito: false,
							inscritos: [],
							total_inscritos: 0,
						};

						const novoCard = criarAtividade(novaAtividade);
						// Insere o novo card depois do botão de criar
						wrapper.parentNode.insertBefore(novoCard, wrapper.nextSibling);

						// Remove o modal e reativa o botão de criar
						wrapper.removeChild(modal);
						btnCriarAtividade.disabled = false;
						btnCriarAtividade.style.visibility = "visible";
					});
			});

			btnModalCancelar.addEventListener("click", () => {
				wrapper.removeChild(modal);
				btnCriarAtividade.disabled = false;
				btnCriarAtividade.style.visibility = "visible";
			});

			wrapper.appendChild(modal);
			btnCriarAtividade.disabled = true;
			btnCriarAtividade.style.visibility = "hidden"; // Alternativa a .remove()
		});

		return wrapper;
	}

	function carregarAtividades(usuarioLogado, pagina = 1, limite = 10) {
		paginaAtual = pagina;
		return fetch(
			usuarioLogado.tipo === "admin"
				? `/api/activities/list?page=${pagina}&limit=${limite}`
				: `/api/user/activities/list?page=${pagina}&limit=${limite}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		)
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
				const atividades = result.data.atividades;
				totalPaginas = Math.ceil(result.data.total / limite);
				atividadeContainer.innerHTML = "";

				// Cria o card do botão e adiciona ao container primeiro
				const cardCriar = cardCriarAtividade(usuarioLogado);
				if (cardCriar) {
					atividadeContainer.appendChild(cardCriar);
				}

				atividades.forEach((atividade) => {
					atividadeContainer.appendChild(criarAtividade(atividade));
				});
				document.querySelector("#infoPagina").textContent = `Página ${paginaAtual}`;
				document.querySelector("#btnAnterior").disabled = paginaAtual === 1;
				document.querySelector("#btnProxima").disabled = paginaAtual === totalPaginas;
			});
	}

	// Essa função cria um modal pra ser reutilizado na criação/edição
	function divModal(tipo, required = true) {
		const modal = document.createElement("div");
		modal.classList.add(`modal-${tipo}-atividade`);

		const inptTitulo = document.createElement("input");
		inptTitulo.className = "modal-input inpt-titulo";
		inptTitulo.type = "text";
		inptTitulo.placeholder = "Título";
		inptTitulo.required = required;

		const textareaDescricao = document.createElement("textarea");
		textareaDescricao.className = "modal-input inpt-descricao";
		textareaDescricao.placeholder = "Descrição";
		textareaDescricao.maxLength = 150;
		textareaDescricao.required = required;

		const inptLocal = document.createElement("input");
		inptLocal.className = "modal-input inpt-local";
		inptLocal.type = "text";
		inptLocal.placeholder = "Local";
		inptLocal.required = required;

		const inptData = document.createElement("input");
		inptData.className = "modal-input inpt-data";
		inptData.type = "date";
		inptData.required = required;

		const inptQtdVagas = document.createElement("input");
		inptQtdVagas.className = "modal-input inpt-qtd-vagas";
		inptQtdVagas.type = "number";
		inptQtdVagas.placeholder = "Quantidade Vagas";
		inptQtdVagas.required = required;

		const btnSalvar = document.createElement("button");
		btnSalvar.className = "btn-salvar";
		btnSalvar.textContent = "Salvar";

		const btnCancelar = document.createElement("button");
		btnCancelar.className = "btn-cancelar";
		btnCancelar.textContent = "Cancelar";

		modal.append(
			inptTitulo,
			textareaDescricao,
			inptLocal,
			inptData,
			inptQtdVagas,
			btnSalvar,
			btnCancelar,
		);
		return modal;
	}

	// Essa função retorna um card completo para ser pendurado em um elemento
	function criarAtividade(atividade) {
		const wrapper = document.createElement("div");
		wrapper.classList.add("card-editar-wrapper");

		const card = document.createElement("div");
		card.classList.add("atividade-card");

		const atvId = document.createElement("div");
		atvId.classList.add("card-id");
		atvId.textContent = "#" + atividade.id;

		const titulo = document.createElement("h3");
		titulo.classList.add("card-titulo");

		const descricao = document.createElement("p");
		descricao.classList.add("card-descricao");

		const local = document.createElement("p");
		local.classList.add("card-local");

		const data = document.createElement("p");
		data.classList.add("card-data");

		const vagas = document.createElement("p");
		vagas.classList.add("card-vagas");

		const statusInscrito = document.createElement("span");

		const listaUsuarios = document.createElement("div");
		listaUsuarios.classList.add("card-inscritos");

		// Botão de Inscrição
		const btnInscricao = document.createElement("button");

		const atualizarCard = () => {
			titulo.textContent = atividade.titulo;
			descricao.textContent = atividade.descricao;
			local.textContent = `Local: ${atividade.local}`;
			const isoDate = atividade.data.slice(0, 10);
			const [ano, mes, dia] = isoDate.split("-");
			data.textContent = `Data: ${dia}/${mes}/${ano}`;

			const vagasDisponiveis = atividade.vagas - atividade.total_inscritos;
			vagas.textContent =
				vagasDisponiveis <= 0
					? "Sem vagas disponíveis"
					: `Vagas: ${vagasDisponiveis} ${
							vagasDisponiveis > 1 ? "disponíveis" : "disponível"
					  }`;

			statusInscrito.textContent = atividade.inscrito ? "✅ Inscrito" : "❌ Não inscrito";
			statusInscrito.className = atividade.inscrito
				? "status inscrito"
				: "status nao-inscrito";

			listaUsuarios.textContent =
				usuarioLogado.tipo === "admin"
					? "Lista de Inscritos:"
					: (listaUsuarios.style.display = "none");

			if (usuarioLogado.tipo === "admin") {
				atividade.inscritos.map((inscrito) => {
					const nome = document.createElement("p");
					nome.textContent = inscrito.nome;
					listaUsuarios.appendChild(nome);
				});
			}
			if (new Date(atividade.data) <= new Date() || vagasDisponiveis <= 0) {
				if (atividade.inscrito) {
					btnInscricao.disabled = false;
				} else {
					btnInscricao.disabled = true;
				}
			}

			btnInscricao.textContent =
				new Date(atividade.data) <= new Date()
					? "Atividade Expirada"
					: atividade.inscrito
					? "Cancelar inscrição"
					: vagasDisponiveis <= 0
					? "Sem Vagas..."
					: "Inscrever-se";

			btnInscricao.className =
				new Date(atividade.data) <= new Date()
					? "expirada"
					: atividade.inscrito
					? "inscrito"
					: vagasDisponiveis <= 0
					? "sem-vagas"
					: "nao-inscrito";

			btnInscricao.classList.add("btn-inscricao");
		};

		atualizarCard();

		// Botões do Card
		const divBotoes = document.createElement("div");
		divBotoes.classList.add("modal-botoes");

		// Botão de Edição
		const btnEditar = document.createElement("button");
		btnEditar.textContent = "✏️";
		btnEditar.classList.add("btn-editar");
		btnEditar.style.display = usuarioLogado.tipo === "admin" ? "" : "none";

		btnEditar.addEventListener("click", () => {
			const modal = divModal("editar", false);

			// Inputs do formulário
			const inptTitulo = modal.querySelector(".inpt-titulo");
			const textareaDescricao = modal.querySelector(".inpt-descricao");
			const inptLocal = modal.querySelector(".inpt-local");
			const inptData = modal.querySelector(".inpt-data");
			const inptQtdVagas = modal.querySelector(".inpt-qtd-vagas");

			// Botões do formulário
			const btnModalSalvar = modal.querySelector(".btn-salvar");
			const btnModalCancelar = modal.querySelector(".btn-cancelar");

			inptTitulo.value = atividade.titulo;
			textareaDescricao.value = atividade.descricao;
			inptLocal.value = atividade.local;
			inptData.value = new Date(atividade.data).toISOString().split("T")[0];
			inptQtdVagas.value = atividade.vagas;

			btnModalSalvar.addEventListener("click", () => {
				btnModalSalvar.disabled = true;
				btnModalSalvar.style.cursor = "not-allowed";

				// Captura dos valores dos inputs
				const atividadeBody = {
					titulo: inptTitulo.value.trim(),
					descricao: textareaDescricao.value.trim(),
					local: inptLocal.value.trim(),
					data: inptData.value,
					vagas: inptQtdVagas.value,
				};

				fetch(`/api/activities/update/${atividade.id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(atividadeBody),
				})
					.then((res) => {
						if (!res.ok) {
							return res.json().then((err) => {
								setTimeout(() => {
									btnModalSalvar.disabled = false;
									btnModalSalvar.style.cursor = "pointer";
								}, 2000);
								popNotifica(err.message, err.success);
								throw new Error(err.message || `Erro ${res.status}`);
							});
						}
						return res.json();
					})
					.then((result) => {
						atividade = { ...atividade, ...atividadeBody };
						atualizarCard();
						setTimeout(() => {
							wrapper.removeChild(modal);
						}, 2000);
						popNotifica(result.message, result.success);
					});
			});

			btnModalCancelar.addEventListener("click", () => {
				wrapper.removeChild(modal);
			});

			wrapper.append(modal);
		});

		// Botão de Remover Card
		const btnRemove = document.createElement("button");
		btnRemove.style.display = usuarioLogado.tipo === "admin" ? "" : "none";
		btnRemove.textContent = "🗑️";

		btnRemove.addEventListener("click", () => {
			btnRemove.disabled = true;
			const modalConfirma = document.createElement("div");
			modalConfirma.classList.add("modal-remove-atividade");
			modalConfirma.textContent = "Confirma?";

			const divBtn = document.createElement("div");

			const btnConfirma = document.createElement("button");
			btnConfirma.textContent = "Sim";
			btnConfirma.addEventListener("click", () => {
				btnConfirma.disabled = true;

				fetch(`/api/activities/delete/${atividade.id}`, {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
				})
					.then((res) => {
						if (!res.ok) {
							return res.json().then((err) => {
								popNotifica(err.message, err.success);
								throw new Error(err.message || `Erro ${res.status}`);
							});
						}
						return res.json();
					})
					.then((result) => {
						popNotifica(result.message, result.success);
						setTimeout(() => {
							wrapper.remove();
						}, 1000);
					});
			});

			const btnCancela = document.createElement("button");
			btnCancela.textContent = "Não";
			btnCancela.addEventListener("click", () => {
				wrapper.removeChild(modalConfirma);
				btnRemove.disabled = false;
			});

			divBtn.append(btnConfirma, btnCancela);
			modalConfirma.appendChild(divBtn);
			wrapper.appendChild(modalConfirma);
		});

		// Botão de Inscrição
		btnInscricao.addEventListener("click", () => {
			btnInscricao.disabled = true;
			btnInscricao.style.cursor = "not-allowed";

			setTimeout(() => {
				btnInscricao.disabled = false;
				btnInscricao.style.cursor = "pointer";
			}, 2500);

			const rota = `/api/user/${usuarioLogado.id}/activities/${atividade.id}/${
				atividade.inscrito ? "unsubscribe" : "subscribe"
			}`;

			fetch(rota, {
				method: atividade.inscrito ? "DELETE" : "POST",
				headers: { "Content-Type": "application/json" },
			})
				.then((res) => {
					if (!res.ok) {
						return res.json().then((err) => {
							popNotifica(err.message, err.success);
							throw new Error(err.message || `Erro ${res.status}`);
						});
					}
					return res.json();
				})
				.then((result) => {
					// Alternar status de inscrição
					atividade.inscrito = !atividade.inscrito;

					// Atualizar total de inscritos
					if (atividade.inscrito) {
						atividade.total_inscritos++;
						usuarioLogado.tipo === "admin" ? atividade.inscritos.push(usuarioLogado) : "";
					} else {
						atividade.total_inscritos--;
						usuarioLogado.tipo === "admin"
							? (atividade.inscritos = atividade.inscritos.filter(
									(inscrito) => inscrito.nome !== usuarioLogado.nome,
							  ))
							: "";
					}

					// Atualizar elementos do DOM
					atualizarCard();

					popNotifica(
						atividade.inscrito
							? "Inscrição realizada com Sucesso!"
							: "Inscrição cancelada com Sucesso!",
						result.success,
					);
				})
				.catch((err) => {
					console.error("Erro ao atualizar inscrição:", err);
				});
		});

		divBotoes.appendChild(btnInscricao);
		divBotoes.appendChild(btnEditar);
		divBotoes.appendChild(btnRemove);

		card.append(
			atvId,
			titulo,
			descricao,
			local,
			data,
			vagas,
			statusInscrito,
			listaUsuarios,
			divBotoes,
		);

		wrapper.append(card);
		return wrapper;
	}

	btnLogout.addEventListener("click", () => {
		fetch("/api/auth/logout", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
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
				btnLogout.disabled = true;
				localStorage.removeItem("usuario");
				popNotifica(result.message, result.success);
				setTimeout(() => {
					navegarPara("/");
				}, 3500);
			});
	});

	btnAnterior.addEventListener("click", () => {
		if (paginaAtual > 1) {
			carregarAtividades(usuarioLogado, paginaAtual - 1, parseInt(selLimite.value));
		}
	});

	btnProxima.addEventListener("click", () => {
		if (paginaAtual < totalPaginas) {
			carregarAtividades(usuarioLogado, paginaAtual + 1, parseInt(selLimite.value));
		}
	});

	selLimite.addEventListener("change", () => {
		carregarAtividades(usuarioLogado, 1, parseInt(selLimite.value));
	});

	// Início do fluxo
	const userToken = await validaToken();

	carregarUsuario(userToken.apelido)
		.then((usuario) => {
			usuarioNome.textContent = usuario.nome;
			return carregarAtividades(usuario, 1, selLimite.value);
		})
		.catch((error) => {
			console.error("Erro geral:", error.message);
			usuarioNome.textContent = "Convidado";
			atividadeContainer.innerText = "Erro ao carregar atividades.";
		});
})();
