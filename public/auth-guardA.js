// auth-guard.js – inclua em todas as páginas protegidas
// Verifica se há sessão ativa; se não houver, redireciona para login.html
(async function () {
  try {
    const resp = await fetch('/sessao', { credentials: 'include' });
    const dados = await resp.json();
    if (!dados.logado) {
      window.location.replace('login.html');
    } else {
      // Disponibiliza o usuário globalmente para a página
      window.ALTABUS_USUARIO = dados.usuario;
      const nomeEl = document.getElementById('nome-usuario');
      if (nomeEl) nomeEl.textContent = dados.usuario.nome;
    }
  } catch (e) {
    console.error('Erro ao verificar sessão:', e);
    window.location.replace('login.html');
  }
})();
