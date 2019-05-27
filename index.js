const config = {
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    EASY_CRON_TOKEN: process.env.EASY_CRON_TOKEN,
};

const url = process.env.APP_URL || 'https://blooming-wave-78383.herokuapp.com:443';

const TelegramBot = require('node-telegram-bot-api');
const options = {
    webHook: {
        port: process.env.PORT
    }
};
const bot = new TelegramBot(config.TELEGRAM_TOKEN, options);
bot.setWebHook(`${url}/bot${config.TELEGRAM_TOKEN}`);
const easycron = require("easy-cron")({ token: config.EASY_CRON_TOKEN });

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

/*const moment = require('moment');
moment.locale('uk');*/


bot.onText(/parse/, (msg)=>{
    const userId = msg.from.id;
    const chatId = msg.chat.id;
    parseSchedule(userId, chatId);
});

function parseSchedule(userId, chatId) {
    JSDOM.fromURL('http://rozklad.kpi.ua/Schedules/ViewSchedule.aspx?g=607599b2-3369-4bda-8320-803f33aac337')
        .then((dom) => {
            const rows = dom.window.document.getElementById('ctl00_MainContent_FirstScheduleTable').getElementsByTagName('tr');
            let currentDay;
            let currentMonth;
            for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
                const item = rows[rowIndex];
                const firstColumn = item.querySelector('td:nth-child(1)');
                const secondColumn = item.querySelector('td:nth-child(2)');

                // Head line for day
                if (!firstColumn.textContent
                    && secondColumn.textContent
                    && secondColumn.textContent.match(/[0123]\.[01][0-9]/)) {
                    const dateTokens = secondColumn.textContent.split('.');
                    currentDay = dateTokens[0];
                    currentMonth = dateTokens[1];
                } else {
                    const firstColumnChildNodes = firstColumn.childNodes;
                    if (secondColumn.innerHTML
                        && firstColumnChildNodes.length
                        && firstColumnChildNodes.length === 3) {
                        const timeTokens = firstColumnChildNodes[2].textContent.split(':');
                        const classStartHour = timeTokens[0];
                        const classStartMinute = timeTokens[1];

                        const className = secondColumn.childNodes[0].textContent;
                        const classTeacher = secondColumn.childNodes[2].textContent;
                        const classRoom = secondColumn.childNodes[4].textContent;

                        const classDescription = `\nSubject: ${className} \nTeacher: ${classTeacher} \nRoom: ${classRoom}`;

                        bot.sendMessage(userId, `OK. ${classDescription}`);
                        easycron.add({
                            minute: classStartMinute,
                            hour: classStartHour,
                            day: currentDay,
                            month: currentMonth,
                            url: `https://api.telegram.org/bot${config.TELEGRAM_TOKEN}/sendMessage?chat_id=${chatId}&text=${classDescription}`,
                            method: 'GET',
                            headers:{
                            },
                            payload: {
                            }
                        }).then(function(response) {
                            console.log("Cron Job Id is " + response.cron_job_id);
                        }).catch(function(error) {
                            console.log(error)
                        });

                    }
                }
            }

        });
}

bot.onText(/remind (.+) at (.+)/, (msg, match) => {
    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const text = match[1];
    const today = new Date();
    const timeTokens = match[2].split(':');
    console.log(`day: ${today.getDate()}, month: ${today.getMonth()}`);
    easycron.add({
        minute: timeTokens[1],
        hour: timeTokens[0],
        day: today.getDate(),
        month: today.getMonth()+1,
        url: `https://api.telegram.org/bot868060908:AAExL4mV3gfQGD-Lnukk0TV43rmtuBduxUs/sendMessage?chat_id=${chatId}&text=${text}`,
        method: 'GET',
        headers:{
        },
        payload: {
        }
    }).then(function(response) {
        console.log("Cron Job Id is " + response.cron_job_id);
    }).catch(function(error) {
        console.log(error)
    });
});

/*moment
cron webHook
submit form
reduce
form data*/