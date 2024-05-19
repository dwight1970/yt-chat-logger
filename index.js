import 'dotenv/config';
import { LiveChat } from 'youtube-chat'
import fs from 'fs';
import express from 'express';
import logHandler from './src/logHandler.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const channelId = process.env.CHANNEL_ID;
const httpPort = process.env.HTTP_PORT;
const liveChat = new LiveChat({ channelId });
const logPath = `${__dirname}/logs/chat.log`;
const fileStream = fs.createWriteStream(logPath);
const app = express();

app.get('/log', logHandler(logPath)); 

app.listen(httpPort, () => {
  console.log(`Server is running on port ${httpPort}`);
});

liveChat.on("start", (liveId) => {
  console.log(`Festiwal spierdolenia czas zacząć! liveId: ${liveId} channelId: ${channelId}`);
  fileStream.write(`Festiwal spierdolenia czas zacząć! liveId: ${liveId} channelId: ${channelId}\n`);
});

liveChat.on("end", (reason) => {
  console.log('Festiwal spierdolenia zakończony.');
  fileStream.write('Festiwal spierdolenia zakończony.\n\n---\n\n');
  fileStream.end();
});

liveChat.on("chat", (chatItem) => {
  fileStream.write(`[${chatItem.timestamp}] ${chatItem.author.name}: ${chatItem.message[0].text}\n`);
});

const ok = liveChat.start().s4;

fileStream.on('error', (err) => console.error('Error while writing log.', err));
liveChat.on('error', (err) => console.error('LiveChat error: ', err));

if (!ok) {
  fileStream.write("Failed to start, check emitted error");
}

