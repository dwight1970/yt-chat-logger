import 'dotenv/config';
import { LiveChat } from 'youtube-chat'
import fs from 'fs';
import express from 'express';
import logHandler from './lib/logHandler.ts';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const channelId = process.env.CHANNEL_ID || '';
const httpPort = process.env.HTTP_PORT;
const liveChat = new LiveChat({channelId});
const logPath = `${__dirname}/../logs/chat.log`;
const fileStream = fs.createWriteStream(logPath);
const app = express();

app.get('/log', logHandler(logPath));

app.listen(httpPort, () => {
    console.log(`Server is running on port ${httpPort}`);
});

liveChat.on("start", (liveId) => {
    console.log(`Log stream has started! liveId: ${liveId} channelId: ${channelId}`);
    fileStream.write(`Log stream has started! liveId: ${liveId} channelId: ${channelId}\n`);
});

liveChat.on("end", (reason) => {
    console.log(`Log stream ended: ${reason || ''}`);
    fileStream.write(`Log stream ended: ${reason || ''}\n\n---\n\n`);
    fileStream.end();
});

liveChat.on("chat", (chatItem) => {
    // @ts-ignore fix types
    fileStream.write(`[${chatItem?.timestamp}] ${chatItem?.author?.name || 'anonim'}: ${chatItem?.message[0].text}\n`);
});


fileStream.on('error', (err) => console.error('Error while writing log.', err));
liveChat.on('error', (err) => {
    // @ts-ignore
    console.error('LiveChat error: ', err.toString());
    // @ts-ignore
    fileStream.write(`LiveChat error: ${err.toString()}\n`);
});

liveChat.start()
    .then((status) => {
        if (!status) {
            fileStream.end();
        }
    });

