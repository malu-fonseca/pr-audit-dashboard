'use strict';

const DISCORD_API = 'https://discord.com/api/v10';
const AUDIT_HEADER = '🔐 Auditoria ISO 27001';
const NAO_CONFORMES_MARKER = /⚠️\s*PRs NÃO CONFORMES/;
const VERIFICAR_MANUALMENTE_MARKER = '🔍 Verificar manualmente';
const CONTINUATION_WINDOW_MS = 60 * 1000;

// Discord message content is raw markdown (**bold**, `code`, _italic_) even
// though it renders as plain formatted text in the client. Strip it so the
// parsing regexes see plain text regardless of how the sender formatted it.
function stripMarkdown(content) {
  return content
    .replaceAll('**', '')
    .replaceAll('`', '')
    .replace(/_([^_\n]+)_/g, '$1');
}

function extractDate(content) {
  const firstLine = content.split('\n')[0];
  const m = firstLine.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}

// Only the "PRs NÃO CONFORMES" block is ever used. "Verificar manualmente" is
// always discarded, per the confirmed message format.
function extractNaoConformesBlock(content) {
  const startMatch = content.match(NAO_CONFORMES_MARKER);
  if (!startMatch) return '';
  const headerLineEnd = content.indexOf('\n', startMatch.index);
  const sectionStart = headerLineEnd === -1 ? content.length : headerLineEnd + 1;
  const endIndex = content.indexOf(VERIFICAR_MANUALMENTE_MARKER);
  const sectionEnd = endIndex === -1 ? content.length : endIndex;
  return content.slice(sectionStart, sectionEnd).trim();
}

function parseEntries(block) {
  const chunks = block
    .split(/\n(?=⚠️\s)/)
    .map((c) => c.trim())
    .filter(Boolean);

  const entries = [];
  for (const chunk of chunks) {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);

    const headerMatch = lines[0].match(/⚠️\s*([^\s#]+)\s*#(\d+)\s*—\s*(.+)/);
    if (!headerMatch) {
      console.warn(`Aviso: não consegui interpretar o cabeçalho do PR, ignorando: "${lines[0]}"`);
      continue;
    }
    const [, repo, prNumber, title] = headerMatch;

    const linkLine = lines.find((l) => l.startsWith('Link:'));
    const link = linkLine ? linkLine.replace(/^Link:\s*/, '').trim() : null;

    const autorLine = lines.find((l) => l.startsWith('Autor:'));
    let author = null;
    let destino = null;
    if (autorLine) {
      const m = autorLine.match(/Autor:\s*(.+?)\s*\|\s*Destino:\s*(.+)/);
      if (m) {
        author = m[1].trim();
        destino = m[2].trim();
      }
    }

    const revLine = lines.find((l) => l.startsWith('Revisores válidos:'));
    let reviewers = [];
    let faltam = null;
    if (revLine) {
      const m = revLine.match(/Revisores válidos:\s*(.+?)\s*\|\s*Faltam:\s*(\d+)/);
      if (m) {
        const revText = m[1].trim();
        reviewers = revText.toLowerCase() === 'nenhum' ? [] : revText.split(',').map((s) => s.trim());
        faltam = parseInt(m[2], 10);
      }
    }

    if (faltam !== 1 && faltam !== 2) {
      console.warn(`Aviso: entrada com "Faltam" inesperado (${faltam}), ignorando: "${lines[0]}"`);
      continue;
    }

    entries.push({
      repo,
      prNumber: Number(prNumber),
      title,
      link,
      author,
      destino,
      reviewers,
      faltam,
      category: faltam === 2 ? 'inadmissivel' : 'medio',
    });
  }
  return entries;
}

function parseAuditMessage(content) {
  const date = extractDate(content);
  const block = extractNaoConformesBlock(content);
  const entries = parseEntries(block);
  return { date, entries };
}

async function fetchRecentMessages(token, channelId, limit) {
  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages?limit=${limit}`, {
    headers: { Authorization: `Bot ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Discord API error ${res.status}: ${await res.text()}`);
  }
  const messages = await res.json();
  // Discord returns newest-first; process chronologically instead.
  return messages.reverse().map((m) => ({ ...m, content: stripMarkdown(m.content) }));
}

// The daily digest can exceed Discord's 2000-char message limit, so the bot
// splits it across consecutive messages. Only the first one carries the
// audit header — everything that follows within a short window and comes
// from the same sender is a continuation and gets stitched back together.
function findLatestAuditGroup(messages) {
  let headerIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].content.startsWith(AUDIT_HEADER)) {
      headerIndex = i;
      break;
    }
  }
  if (headerIndex === -1) return null;

  const group = [messages[headerIndex]];
  let lastTimestamp = new Date(messages[headerIndex].timestamp).getTime();
  for (let i = headerIndex + 1; i < messages.length; i++) {
    const msg = messages[i];
    const ts = new Date(msg.timestamp).getTime();
    const sameSender = msg.author?.id === messages[headerIndex].author?.id;
    const withinWindow = ts - lastTimestamp <= CONTINUATION_WINDOW_MS;
    if (!sameSender || !withinWindow || msg.content.startsWith(AUDIT_HEADER)) break;
    group.push(msg);
    lastTimestamp = ts;
  }
  return group;
}

async function fetchAndParse({ token, channelId } = {}) {
  const botToken = token || process.env.DISCORD_BOT_TOKEN;
  const channel = channelId || process.env.DISCORD_CHANNEL_ID;
  if (!botToken || !channel) {
    throw new Error('Defina DISCORD_BOT_TOKEN e DISCORD_CHANNEL_ID (veja BOT_SETUP.md).');
  }
  const messages = await fetchRecentMessages(botToken, channel, 25);
  const group = findLatestAuditGroup(messages);
  if (!group) {
    throw new Error('Nenhuma mensagem de auditoria (🔐 Auditoria ISO 27001) encontrada nas últimas 25 mensagens do canal.');
  }
  const combinedContent = group.map((m) => m.content).join('\n');
  const { date, entries } = parseAuditMessage(combinedContent);
  return { date, messageId: group[0].id, entries };
}

module.exports = { parseAuditMessage, extractDate, extractNaoConformesBlock, parseEntries, fetchAndParse };

if (require.main === module) {
  fetchAndParse()
    .then((record) => {
      console.log(JSON.stringify(record, null, 2));
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
