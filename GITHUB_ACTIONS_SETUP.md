# Configurar o GitHub Actions (busca diária no Discord)

A busca no Discord agora roda numa GitHub Action, que tem acesso normal à internet (diferente do
ambiente da rotina do Claude, que bloqueia esse acesso). Dois ajustes rápidos no repositório e ela
roda sozinha todo dia.

## 1. Adicionar o token do bot como "Secret"

1. Abra https://github.com/malu-fonseca/pr-audit-dashboard
2. Vá em **Settings → Secrets and variables → Actions**
3. Clique em **New repository secret**
4. Nome: `DISCORD_BOT_TOKEN`
5. Valor: cole o token do bot (o mesmo que você pegou no Discord Developer Portal)
6. Clique em **Add secret**

## 2. Dar permissão de escrita para as Actions

Por padrão o GitHub não deixa uma Action commitar/dar push no repositório. Precisa liberar:

1. No mesmo repositório, vá em **Settings → Actions → General**
2. Role até **Workflow permissions**
3. Marque **Read and write permissions**
4. Clique em **Save**

## 3. Testar manualmente

1. Vá na aba **Actions** do repositório
2. Clique no workflow **"Daily PR audit ingestion"** na lista à esquerda
3. Clique em **Run workflow** (botão à direita) → **Run workflow** de novo pra confirmar
4. Acompanhe a execução — deve ficar verde (✅) em menos de um minuto

Se der certo, `data/history.json` e `dashboard.html` só vão ser alterados/commitados quando houver
um dia novo de auditoria (a Action detecta se não há nada novo e não faz commit à toa).

## Agendamento

A Action já está configurada para rodar todo dia às **12:15 UTC** (09:15 horário de Brasília),
cerca de 15 minutos depois do horário em que a auditoria costuma ser postada no Discord. A rotina
do Claude que atualiza o dashboard publicado roda às 12:30 UTC, 15 minutos depois — tempo de sobra
para a Action terminar.
