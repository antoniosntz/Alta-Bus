# Correção aplicada no login do AltaBus

Correções realizadas:

1. Foi adicionado `app.set('trust proxy', 1);` no `servidor.js`.
   - Isso é necessário para o cookie de sessão funcionar corretamente em produção na Vercel.

2. O login agora salva a sessão com `req.session.save()` antes de responder ao navegador.
   - Isso evita que o sistema redirecione para `pontos.html` antes da sessão estar gravada.

3. O redirecionamento de usuários do tipo `motorista` foi ajustado para `pontos.html`.
   - O projeto não possui o arquivo `motorista.html`, então isso poderia causar erro.

4. A tela `login.html` também foi ajustada para redirecionar usuários já logados para `pontos.html`.

Como publicar novamente:

```bash
vercel --prod --force
```

Depois teste o login novamente.
