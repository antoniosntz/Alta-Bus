function reportarStatus(tipoStatus, elementoBotao) {
    // 1. Remove a classe 'active' de todos os botões dessa área
    const botoes = document.querySelectorAll('.btn-status');
    botoes.forEach(btn => btn.classList.remove('active'));

    // 2. Adiciona a classe 'active' apenas no botão que foi clicado
    elementoBotao.classList.add('active');

    // 3. Envia a informação para o servidor via Fetch API
    fetch('/atualizar-status-onibus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: tipoStatus })
    })
    .then(resposta => {
        if (resposta.ok) {
            console.log("Status atualizado com sucesso: " + tipoStatus);
        }
    })
    .catch(erro => console.error("Erro ao reportar status:", erro));
}