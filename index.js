const TOKEN = "868060908:AAExL4mV3gfQGD-Lnukk0TV43rmtuBduxUs";
const TelegramBot = require('node-telegram-bot-api');
const options = {
    webHook: {
        port: process.env.PORT
    }
};
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const url = process.env.APP_URL || 'https://blooming-wave-78383.herokuapp.com:443';
const bot = new TelegramBot(TOKEN, options);
const moment = require('moment');
moment.locale('uk');

const EASY_CRON_TOKEN = "f2764643a41fbeffb6d9fbe2cb735546";
const easycron = require("easy-cron")({ token: EASY_CRON_TOKEN })

bot.setWebHook(`${url}/bot${TOKEN}`);

bot.onText(/group (.+)/, (msg, match) => {
    const userId = msg.from.id;
    const groupName = match[1];
    bot.sendMessage(userId, `OK. ${match[1]}`);
});


// Just to ping!
bot.on('message', function onMessage(msg) {
    bot.sendMessage(msg.chat.id, 'I am alive on Heroku!');
});
bot.onText(/parse/, (msg)=>{
    const userId = msg.from.id;
    parseSchedule(userId);
});

function parseSchedule(userId) {
    JSDOM.fromURL('http://rozklad.kpi.ua/Schedules/ViewSchedule.aspx?g=607599b2-3369-4bda-8320-803f33aac337')
        .then((dom) => {
            const rows = dom.window.document.getElementById('ctl00_MainContent_FirstScheduleTable').getElementsByTagName('tr');
            let currentDay;
            for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
                const item = rows[rowIndex];
                const firstColumn = item.querySelector('td:nth-child(1)');
                const secondColumn = item.querySelector('td:nth-child(2)');

                // Head line for day
                if (!firstColumn.innerHTML
                    && secondColumn.innerHTML
                    && secondColumn.innerHTML.match(/[0123]\.[01][0-9]/)) {
                    currentDay = moment(secondColumn.innerHTML, 'DD.MM');
                } else {
                    const firstColumnChildNodes = firstColumn.childNodes;
                    if (secondColumn.innerHTML
                        && firstColumnChildNodes.length
                        && firstColumnChildNodes.length === 3) {
                        const timeTokens = firstColumnChildNodes[2].textContent.split(':');

                        const className = secondColumn.childNodes[0].textContent;
                        const classTeacher = secondColumn.childNodes[2].textContent;
                        const classRoom = secondColumn.childNodes[4].textContent;
                        const classDateTime = currentDay.hours(parseInt(timeTokens[0], 10))
                            .minutes(parseInt(timeTokens[1], 10));

                        const classDescription = `\nSubject: ${className} \nTeacher: ${classTeacher} \nRoom: ${classRoom}`;
                        bot.sendMessage(userId, `OK. ${classDescription}`);
                        easycron.add({
                            minute: 39,
                            hour: 22,
                            day: 26,
                            month: 5,
                            url: `https://api.telegram.org/bot868060908:AAExL4mV3gfQGD-Lnukk0TV43rmtuBduxUs/sendMessage?chat_id=386033446&text=${classDescription}`,
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

                        break;
                    }
                }
            }

        });
}

bot.onText(/remind (.+) at (.+)/, (msg, match) => {
    const userId = msg.from.id;
    const text = match[1];
    const timeTokens = match[2].split(':');

    easycron.add({
        minute: timeTokens[1],
        hour: timeTokens[0],
        day: 26,
        month: 5,
        url: `https://api.telegram.org/bot868060908:AAExL4mV3gfQGD-Lnukk0TV43rmtuBduxUs/sendMessage?chat_id=386033446&text=${text}`,
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