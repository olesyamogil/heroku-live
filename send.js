const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const FormData = require('form-data');
//const http = require('http');
const fetch = require('node-fetch');

function sendForm (){
    JSDOM.fromURL('http://rozklad.kpi.ua/Schedules/ScheduleGroupSelection.aspx')
        .then((dom) => {
            const form = dom.window.document.querySelectorAll('form input');
            const form1 = dom.window.document.querySelectorAll('form');
            let formData = {};
            console.log(form1);
            console.log("===========================");
            let formArray = Array.from(form);
            formArray.forEach(function(item, index){
                formData[item.getAttribute("name")]=item.value;
                console.log(index + item.getAttribute("name") + '------' + item.value + '\n');
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
                console.log( body );
                const dom = new JSDOM(body);
            });

            // fetch('http://rozklad.kpi.ua/Schedules/ScheduleGroupSelection.aspx',
            //     { method: 'POST', body: formData, redirect: 'follow',  follow: 20})
            //     .then(res => res.text())
            //     .then(body => console.log(body));

            // let form = new FormData();
            //
            // form.append('a', 1);
            //
            // fetch('http://example.com', { method: 'POST', body: form })
            //     .then(function(res) {
            //         return res.json();
            //     }).then(function(json) {
            //     console.log(json);
            // });

            // formData.submit('http://rozklad.kpi.ua/Schedules/ScheduleGroupSelection.aspx', function(err, res) {
            //     // res – response object (http.IncomingMessage)  //
            //     let a = res.resume();
            //     console.log(a.responseText);
            //     console.log(Object.getOwnPropertyNames(res));
            //     // console.log(res);
            //     console.log(a.statusMessage);
            //     console.log(a.headers);
            //     console.log(a.responseText);
            //     console.log(a.response);
            //     console.log(a.window);
            //     console.log(a.body);
            //     console.log(a.content);
            //     // console.log(a.req);
            // });

        });

}
sendForm();



// form.submit('http://example.org/', function(err, res) {
// //     // res – response object (http.IncomingMessage)  //
// //     res.resume();
// // });

// request.post({url:'ScheduleGroupSelection.aspx', formData: form}, function(err, httpResponse, body) {
//     if (err) {
//         return console.error('upload failed:', err);
//     }
//     console.log('Upload successful!  Server responded with:', body);
// });
/*/Schedules/ViewSchedule.aspx?g=607599b2-3369-4bda-8320-803f33aac337*/