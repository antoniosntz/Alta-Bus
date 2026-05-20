# Correção da rota /tempo

O erro `Erro em /tempo: Request failed with status code 400` estava acontecendo na consulta ao Traccar.

## O que foi ajustado

1. O `TRACCAR_DEVICE_ID` padrão foi corrigido de `97194109` para `13519`, que é o mesmo ID indicado no `COMO_RODAR.md` e cadastrado no seed do banco.
2. A chamada ao Traccar foi ajustada para usar `params: { deviceId: DEVICE_ID }` no Axios, deixando a URL mais segura e evitando erro por montagem manual de query string.
3. A rota `/tempo` agora mostra uma mensagem mais clara quando o Traccar retorna erro 400.
4. As rotas `/localizacao-atual`, `/tempo` e `/api/rastreio` agora registram logs mais detalhados sobre falha no Traccar.

## Importante na Vercel

Confira se estas variáveis existem no projeto da Vercel:

```env
TRACCAR_URL=https://demo4.traccar.org
TRACCAR_DEVICE_ID=13519
TRACCAR_TOKEN=SEU_TOKEN_VALIDO_DO_TRACCAR
```

Se o token do Traccar estiver vencido ou não pertencer ao mesmo dispositivo, o erro 400 pode continuar.
