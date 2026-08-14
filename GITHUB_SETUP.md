# Como criar o repositório no GitHub

A rotina agendada do Claude roda isolada na nuvem e só enxerga um repositório Git — não os
arquivos do seu PC. Este repositório vai guardar o script de ingestão e o histórico dos dias
já processados, para que o filtro "todo o período" do dashboard funcione.

## Passos

1. Acesse https://github.com/new
2. Nome sugerido: `pr-audit-dashboard` (pode escolher outro)
3. Visibilidade: **Private** (recomendado — os dados são de PRs internos da empresa)
4. **Não** marque "Add a README" (vamos subir o conteúdo que já existe localmente)
5. Clique em **Create repository**
6. Copie a URL HTTPS do repositório (ex: `https://github.com/seu-usuario/pr-audit-dashboard.git`)

Depois disso, me passe essa URL para eu:
- Inicializar o repositório local em `discord-pr-dashboard/`
- Commitar o script (`fetch-and-parse.js`), o guia do bot, e um `data/history.json` inicial vazio
- Fazer o push para o GitHub

Se o `git push` pedir autenticação e não tiver uma credencial salva na máquina, o GitHub vai
pedir um **Personal Access Token** (não a senha da conta) — nesse caso te aviso na hora e te
mostro como gerar um em https://github.com/settings/tokens.
