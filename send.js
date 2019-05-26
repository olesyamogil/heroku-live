const EASY_CRON_TOKEN = "f2764643a41fbeffb6d9fbe2cb735546";
const easycron = require("easy-cron")({ token: EASY_CRON_TOKEN })

easycron.add({
    minute: 39,
    hour: 22,
    day: 26,
    month: 5,
    url: `https://api.telegram.org/bot868060908:AAExL4mV3gfQGD-Lnukk0TV43rmtuBduxUs/sendMessage?chat_id=386033446&text=1111222`,
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