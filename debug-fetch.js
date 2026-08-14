'use strict';

async function main() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_CHANNEL_ID;
  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages?limit=30`, {
    headers: { Authorization: `Bot ${token}` },
  });
  const messages = await res.json();
  console.log('message count:', messages.length);
  messages
    .slice()
    .reverse() // chronological order, oldest first
    .forEach((m) => {
      console.log(`\n===== id=${m.id} author=${m.author?.username} authorId=${m.author?.id} ts=${m.timestamp} len=${m.content.length} =====`);
      console.log(m.content);
    });
}

main();
