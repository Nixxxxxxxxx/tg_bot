const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { Telegraf } = require("telegraf");
require("dotenv").config();

// Инициализация
const app = express();
const PORT = process.env.PORT || 3000;

const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_USERNAME = "@nix_ux_view";

// Express middlewares
app.use(cors());
app.use(express.json());

// Telegraf бот
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// Команда /start с кнопкой
bot.command("start", (ctx) => {
  ctx.reply("Добро пожаловать! Нажмите кнопку ниже, чтобы открыть WebApp:", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🚀 Открыть приложение",
            web_app: { url: "https://miniappfrontnew.vercel.app" },
          },
        ],
      ],
    },
  });
});

// Обработка /check-subscription
app.post("/check-subscription", async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    return res.status(500).json({ error: "BOT_TOKEN is missing" });
  }

  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChatMember?chat_id=${CHANNEL_USERNAME}&user_id=${user_id}`;
    const response = await axios.get(url);

    const status = response?.data?.result?.status;
    if (["member", "administrator", "creator"].includes(status)) {
      return res.json({ status: "subscribed" });
    }
    res.json({ status: "not_subscribed" });
  } catch (error) {
    console.error("Telegram API error:", error?.response?.data || error.message);
    res.status(500).json({
      error: "Telegram API error",
      details: error?.response?.data || error.message,
    });
  }
});

// Health-check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: TELEGRAM_BOT_TOKEN
      ? "Backend and Bot are running"
      : "BOT_TOKEN missing",
  });
});

// Запуск Express
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

// Запуск бота
bot.launch().then(() => {
  console.log("🤖 Bot is up and running");
});

// Для корректного завершения на хостинге (например, Render)
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
