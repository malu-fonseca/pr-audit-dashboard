'use strict';

const { parseAuditMessage } = require('./fetch-and-parse');

const sample = `🔐 Auditoria ISO 27001 — Revisores Mínimos (Bitbucket) — 13/08/2026

⚠️ PRs NÃO CONFORMES (7) — menos de 2 revisores distintos do autor:

⚠️ neo-omnichannel #3786 — hotfix/insert-batches
Link: https://bitbucket.org/implytecnologiaeletronica/neo-omnichannel/pull-requests/3786
Autor: Lorenzo Augusto Colome | Destino: master
Revisores válidos: Luiza Daiane Rabuski | Faltam: 1

⚠️ front-vue-omni-admin #2167 — EC-2956 - Ajustes recarga bonificada
Link: https://bitbucket.org/implytecnologiaeletronica/front-vue-omni-admin/pull-requests/2167
Autor: Geórgia G da Rosa | Destino: master
Revisores válidos: Matheus Reusch | Faltam: 1

⚠️ frontend-eleven-360-internacional #448 — E11-13136 ctz Integração Insider Básica e Avançada
Link: https://bitbucket.org/implytecnologiaeletronica/frontend-eleven-360-internacional/pull-requests/448
Autor: Anderson Keller | Destino: master
Revisores válidos: Eduardo Wegner | Faltam: 1

⚠️ backend-cashless #2345 — [ECASH-3722] Suprimido warning de auditoria sem usuario no sentry e corrigida rota do totem login
Link: https://bitbucket.org/implytecnologiaeletronica/backend-cashless/pull-requests/2345
Autor: Vinícius Rehbein Kobs | Destino: master
Revisores válidos: Marson de Souza | Faltam: 1

⚠️ we8 #713 — E11-13079 | ElevenTickets - Removendo titular do convidado e adicionando mensagem no cadastro de portador quando nao tiver convidado
Link: https://bitbucket.org/implytecnologiaeletronica/we8/pull-requests/713
Autor: Émerson Rodrigues de Oliveira | Destino: release/master-prod
Revisores válidos: Maurício Helfer Kretzmann | Faltam: 1
⚠️ frontend-circus-credenciamento-imply-vue3 #156 — Hotfix/sessao expirada cache deploy
Link: https://bitbucket.org/implytecnologiaeletronica/frontend-circus-credenciamento-imply-vue3/pull-requests/156
Autor: Marcos Antonio Andrade Piemontez | Destino: master
Revisores válidos: nenhum | Faltam: 2

⚠️ frontend-membership-imply #442 — feat: E11-13360 - configuração da identificacao do dependente na adesao via CMS
Link: https://bitbucket.org/implytecnologiaeletronica/frontend-membership-imply/pull-requests/442
Autor: Anderson Keller | Destino: master
Revisores válidos: nenhum | Faltam: 2

🔍 Verificar manualmente (2) — branch de destino ambígua:

🔍 frontend-membership-imply #395 — E11-13180 xavante tratamento da mensagem de cadastro incompleto na assinatura
Link: https://bitbucket.org/implytecnologiaeletronica/frontend-membership-imply/pull-requests/395
Autor: Masseid Anderson da Silva | Destino: master-xavante

🔍 frontend-membership-imply #443 — E11-11237 automacao meuplano playwright
Link: https://bitbucket.org/implytecnologiaeletronica/frontend-membership-imply/pull-requests/443
Autor: LuisFernandoSilveira | Destino: homolog-default`;

const result = parseAuditMessage(sample);
console.log(JSON.stringify(result, null, 2));

const inadmissivel = result.entries.filter((e) => e.category === 'inadmissivel');
const medio = result.entries.filter((e) => e.category === 'medio');

console.log(`\nTotal: ${result.entries.length} (esperado: 7)`);
console.log(`Inadmissível: ${inadmissivel.length} (esperado: 2)`);
console.log(`Médio: ${medio.length} (esperado: 5)`);

const ok = result.entries.length === 7 && inadmissivel.length === 2 && medio.length === 5 && result.date === '2026-08-13';
console.log(ok ? '\n✅ PASSOU' : '\n❌ FALHOU');
process.exit(ok ? 0 : 1);
