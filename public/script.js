/*const usuarios = [

{
email:"motorista@altabus.com",
senha:"123",
tipo:"motorista"
},

{
email:"cliente@altabus.com",
senha:"123",
tipo:"cliente"
}

];

function validarLogin(){

const email =
document.getElementById("login-email").value;

const senha =
document.getElementById("login-pass").value;

const usuario =
usuarios.find(u =>
u.email === email && u.senha === senha
);

if(!usuario){

alert("Email ou senha incorretos");
return;

}

if(usuario.tipo === "motorista"){

window.location.href="motorista.html";

}

if(usuario.tipo === "cliente"){

window.location.href="pontos.html";
}

function voltar() {
    window.location.href = "login.html";
}

function voltar() {
    window.location.href = "pontos.html"; // Ou a página que desejar
}

}*/
// segunda parte para conectar ao banco

/* Função para realizar o login consultando o servidor e o banco de dados
async function validarLogin() {
    // Obtém os valores dos campos (ajustados para os IDs que aparecem no teu HTML)
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (!email || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        // Envia os dados para a rota /login que criámos no servidor
        const resposta = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (dados.success) {
            // Se o login for bem-sucedido, redireciona para a página enviada pelo servidor
            window.location.href = dados.redirect;
        } else {
            // Se falhar, mostra a mensagem de erro vinda do banco de dados
            alert(dados.message);
        }
    } catch (erro) {
        console.error("Erro ao conectar com o servidor:", erro);
        alert("Erro ao conectar com o servidor. Verifique se o XAMPP e o Node.js estão ligados.");
    }
}

// Funções de navegação (Voltar)
function voltarParaLogin() {
    window.location.href = "login.html";
}

function voltarParaPontos() {
    window.location.href = "pontos.html";
}*/

//Terceira parte para conectar ao banco 

async function validarLogin() {
    // Captura os valores dos inputs pelos IDs corretos do seu HTML
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (!email || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        // Envia os dados para a rota de login do seu servidor Node.js
        const resposta = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (dados.success) {
            // Redireciona conforme o tipo de usuário retornado pelo banco
            window.location.href = dados.redirect;
        } else {
            alert(dados.message || "E-mail ou senha incorretos.");
        }
    } catch (erro) {
        console.error("Erro na conexão:", erro);
        alert("Não foi possível conectar ao servidor. Verifique se o Node.js e o XAMPP estão ativos.");
    }
}

// Funções de navegação corrigidas
function voltar() {
    window.location.href = "login.html";
}

function voltarParaPontos() {
    window.location.href = "pontos.html";
}

 function irParaCadastro() {
            window.location.href = "cadastro.html";
        }