'use strict';

const fs = require('fs');
const path = require('path');
const { fetchAndParse } = require('./fetch-and-parse');

const HISTORY_PATH = path.join(__dirname, 'data', 'history.json');
const DASHBOARD_PATH = path.join(__dirname, 'dashboard.html');
const HISTORY_BLOCK = /(<script type="application\/json" id="history-data">)[\s\S]*?(<\/script>)/;

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

async function main() {
  const record = await fetchAndParse();
  if (!record.date) {
    throw new Error(
      `Não consegui extrair a data da mensagem (messageId=${record.messageId}). ` +
        'O formato do cabeçalho deve ter mudado de novo — não vou gravar um registro sem data.'
    );
  }
  const history = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8'));

  const existingIndex = history.findIndex((d) => d.date === record.date);
  let changed = false;
  if (existingIndex === -1) {
    history.push(record);
    changed = true;
  } else if (!deepEqual(history[existingIndex].entries, record.entries)) {
    history[existingIndex] = record;
    changed = true;
  }

  if (!changed) {
    console.log('SEM_MUDANCA');
    return;
  }

  history.sort((a, b) => (a.date < b.date ? -1 : 1));
  const historyJson = JSON.stringify(history, null, 2);
  fs.writeFileSync(HISTORY_PATH, historyJson + '\n');

  const dashboard = fs.readFileSync(DASHBOARD_PATH, 'utf8');
  if (!HISTORY_BLOCK.test(dashboard)) {
    throw new Error('Não encontrei o bloco <script id="history-data"> em dashboard.html.');
  }
  const updatedDashboard = dashboard.replace(HISTORY_BLOCK, (_, open, close) => `${open}\n${historyJson}\n${close}`);
  fs.writeFileSync(DASHBOARD_PATH, updatedDashboard);

  console.log(`ATUALIZADO:${record.date}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
