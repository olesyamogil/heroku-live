const config = require('./config.js');

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(config.TELEGRAM_TOKEN);
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
                        const TIME_COLUMN_INDEX = 2;
                        const timeTokens = firstColumnChildNodes[TIME_COLUMN_INDEX].textContent.split(':');

                        const HOURS_TOKEN_INDEX = 0;
                        const classStartHour = timeTokens[HOURS_TOKEN_INDEX];

                        const MINUTES_TOKEN_INDEX = 1;
                        const classStartMinute = timeTokens[MINUTES_TOKEN_INDEX];

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
function sendForm (){
    JSDOM.fromURL('http://rozklad.kpi.ua/Schedules/ScheduleGroupSelection.aspx')
        .then((dom) => {
            const form = dom.window.document.querySelectorAll('form input');
            const form1 = dom.window.document.querySelectorAll('form');
            let formData = {};
            let formArray = Array.from(form);
            formArray.forEach(function(item, index){
                formData[item.getAttribute("name")]=item.value;
            });
            formData["ctl00$MainContent$ctl00$txtboxGroup"] = "ІС-з61";
            let request = require("request"),
                options = {
                    url: 'http://rozklad.kpi.ua/Schedules/ScheduleGroupSelection.aspx',
                    timeout: 2000,
                    followAllRedirects: true,
                    method: 'POST',
                    formData: formData
                };
            request.post( options, function(error, response, body) {
                //console.log( body );
                const scheduleDOM = new JSDOM(body);
                const rows = scheduleDOM.window.document.getElementById('ctl00_MainContent_FirstScheduleTable').getElementsByTagName('tr');
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
                            const TIME_COLUMN_INDEX = 2;
                            const timeTokens = firstColumnChildNodes[TIME_COLUMN_INDEX].textContent.split(':');

                            const HOURS_TOKEN_INDEX = 0;
                            const classStartHour = timeTokens[HOURS_TOKEN_INDEX];

                            const MINUTES_TOKEN_INDEX = 1;
                            const classStartMinute = timeTokens[MINUTES_TOKEN_INDEX];

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
        });

}
sendForm();
bot.onText(/remind (.+) at (.+)/, (msg, match) => {
    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const text = match[1];
    const today = new Date();
    const timeTokens = match[2].split(':');
    easycron.add({
        minute: timeTokens[1],
        hour: timeTokens[0],
        day: today.getDate(),
        month: today.getMonth()+1,
        url: `${config.APP_URL}/sendNow`,
        method: 'POST',
        headers:{
        },
        payload: {
            chat_id: chatId,
            text: text,
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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Function to handle the root path
app.post('/sendNow', (req, res) => {
    const PAYLOAD = JSON.parse(req.body.payload);
    bot.sendMessage(PAYLOAD.chat_id, PAYLOAD.text);

    res.end('OK');
});
// Function to handle the root path
app.post(`/bot${config.TELEGRAM_TOKEN}`, (req, res) => {
    console.log(req.body);
    bot.processUpdate(req.body);

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