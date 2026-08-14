# Como criar o bot do Discord (passo a passo)

O link que você tinha (`https://discord.com/api/webhooks/...`) é um **incoming webhook** — só serve para
enviar mensagens para o canal. Para o dashboard conseguir *ler* as mensagens que já estão lá, é preciso
um bot de verdade, com token.

## 1. Criar a aplicação

1. Acesse https://discord.com/developers/applications
2. Clique em **New Application**, dê um nome (ex: `pr-audit-reader`) e crie.

## 2. Criar o bot e habilitar a intent certa

1. No menu lateral, vá em **Bot**.
2. Clique em **Add Bot** (ou já vem criado automaticamente).
3. Role até **Privileged Gateway Intents** e ative **Message Content Intent**.
   - Sem isso, o Discord não deixa o bot ler o conteúdo das mensagens do canal.
4. Clique em **Reset Token** (ou **Copy**) para pegar o **Bot Token**.
   - Trate esse token como uma senha. Não cole em nenhum arquivo do projeto, não mande em chat público.

## 3. Convidar o bot para o servidor

1. No menu lateral, vá em **OAuth2 → URL Generator**.
2. Em **Scopes**, marque `bot`.
3. Em **Bot Permissions**, marque:
   - `View Channel`
   - `Read Message History`
4. Copie a URL gerada lá embaixo, abra num navegador logado no Discord, e escolha o servidor onde está o
   canal de auditoria (`implytecnologiaeletronica` ou o servidor correspondente).
5. Confirme a autorização.

## 4. Pegar o ID do canal

1. No app/site do Discord, vá em **Configurações → Avançado** e ative o **Modo Desenvolvedor**.
2. Clique com o botão direito no canal onde a auditoria é postada.
3. Clique em **Copiar ID do Canal**.

## 5. Guardar as credenciais como variáveis de ambiente

**Nunca** coloque o token direto em um arquivo do projeto. Configure como variável de ambiente local:

**PowerShell (Windows):**
```powershell
$env:DISCORD_BOT_TOKEN = "cole_o_token_aqui"
$env:DISCORD_CHANNEL_ID = "cole_o_id_do_canal_aqui"
```

Essas variáveis só duram na sessão atual do terminal. Para não precisar repetir toda vez, você pode
definir como variável de ambiente permanente do Windows (Configurações → Variáveis de Ambiente), ou criar
um arquivo `.env` local (que **não** deve ser commitado/compartilhado) e carregar antes de rodar o script.

## 6. Testar

Depois de configurar as duas variáveis, rode:

```powershell
node fetch-and-parse.js
```

Se tudo estiver certo, ele deve imprimir os PRs "Inadmissível" e "Médio" extraídos da mensagem mais
recente do canal.
