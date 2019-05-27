const config = require('./config.js');

const url = process.env.APP_URL || 'https://blooming-wave-78383.herokuapp.com:443';

const TelegramBot = require('node-telegram-bot-api');
const options = {
    // webHook: {
    //     port: config.APP_PORT
    // }
};
const bot = new TelegramBot(config.TELEGRAM_TOKEN, options);
// bot.setWebHook(`${url}/bot${config.TELEGRAM_TOKEN}`);
const easycron = require("easy-cron")({ token: config.EASY_CRON_TOKEN });

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

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
                    currentDay = parseInt(dateTokens[0]);
                    currentMonth = parseInt(dateTokens[1]);
                } else { // Every single class
                    const firstColumnChildNodes = firstColumn.childNodes;
                    const secondColumnChildNodes = secondColumn.childNodes;
                    const secondColumnArray = Array.from(secondColumnChildNodes);

                    if (secondColumn.innerHTML
                        && firstColumnChildNodes.length
                        && firstColumnChildNodes.length === 3) {
                        const timeTokens = firstColumnChildNodes[2].textContent.split(':');
                        const classStartHour = timeTokens[0];
                        const classStartMinute = timeTokens[1];

                        const classDescription = secondColumnArray.reduce(
                            (accumulator, currentValue) => {
                                return accumulator + currentValue.textContent + '\n'
                            },
                            '');
                        const message = `${currentDay}.${currentMonth} ${classStartHour}:${classStartMinute} \n ${classDescription}`;
                        bot.sendMessage(userId, message);
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

const express        =        require("express");
const bodyParser     =        require("body-parser");
const app            =        express();
//Here we are configuring express to use body-parser as middle-ware.
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// Function to handle the root path
app.post('/', (req, res) => {
    console.log(req.params);
    console.log(req.body);
    console.log(req.query);
    console.log(req.param('page'));
    // console.log(req.body);
    // Access the provided 'page' and 'limt' query parameters
    // let page = req.query.page;
    // let limit = req.query.limit;

    // Return the articles to the rendering engine
    res.end('ddddd');
});
console.log(`${config.APP_URL}/bot${config.TELEGRAM_TOKEN}`);
// Function to handle the root path
app.post(`${config.APP_URL}/bot${config.TELEGRAM_TOKEN}`, (req, res) => {
    console.log(req.params);
    console.log(req.body);
    console.log(req.query);
    // Access the provided 'page' and 'limt' query parameters
    // let page = req.query.page;
    // let limit = req.query.limit;

    // Return the articles to the rendering engine
    res.end('ddddd');
});

let server = app.listen(config.APP_PORT, function() {
    console.log('Server is listening on port ' + config.APP_PORT)
});



/*
cron webHook
submit form
reduce
form data*/