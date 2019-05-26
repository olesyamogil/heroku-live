const TOKEN = "868060908:AAExL4mV3gfQGD-Lnukk0TV43rmtuBduxUs";
const TelegramBot = require('node-telegram-bot-api');
const options = {
    webHook: {
        port: process.env.PORT
    }
};
const url = process.env.APP_URL || 'https://blooming-wave-78383.herokuapp.com:443';
const bot = new TelegramBot(TOKEN, options);

bot.setWebHook(`${url}/bot${TOKEN}`);

bot.onText(/group (.+)/, (msg, match) => {
    const userId = msg.from.id;
    bot.sendMessage(userId, `OK. ${match[0]}`);
});


// Just to ping!
bot.on('message', function onMessage(msg) {
    bot.sendMessage(msg.chat.id, 'I am alive on Heroku!');
});