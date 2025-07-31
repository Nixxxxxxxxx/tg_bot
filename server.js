import express from 'express';
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

app.use('/web', express.static(path.join(__dirname, 'web')));
app.use(express.json());

app.post('/check-subscription', async (req, res) => {
  const userId = req.body.userId;
  const channel = process.env.CHANNEL_USERNAME;

  try {
    const member = await bot.telegram.getChatMember(channel, userId);
    const isSubscribed = ['member', 'administrator', 'creator'].includes(member.status);
    res.json({ ok: true, subscribed: isSubscribed });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

bot.command('start', async (ctx) => {
  await ctx.reply('Проверьте подписку на канал:', {
    reply_markup: {
      inline_keyboard: [[
        {
          text: 'Проверить подписку',
          web_app: { url: process.env.WEBAPP_URL }
        }
      ]]
    }
  });
});

bot.launch();
app.listen(process.env.PORT || 3000, () => {
  console.log(`✅ Server running`);
});
