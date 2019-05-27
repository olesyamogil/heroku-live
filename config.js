const config = {
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    EASY_CRON_TOKEN: process.env.EASY_CRON_TOKEN,
    APP_URL: process.env.APP_URL || 'https://blooming-wave-78383.herokuapp.com:443',
    APP_PORT: process.env.PORT || 443,
};

module.exports = config;
