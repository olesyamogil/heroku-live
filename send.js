const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const FormData = require('form-data');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function sendForm (){
    JSDOM.fromURL('http://rozklad.kpi.ua/Schedules/ScheduleGroupSelection.aspx')
        .then((dom) => {
            const form = dom.window.document.getElementsByTagName('form');
            var formData = new FormData(form);
            formData.append( 'ctl00$MainContent$ctl00$txtboxGroup', 'ІСз-61');
            var request = new XMLHttpRequest();
            request.open("POST", "ScheduleGroupSelection.aspx");
            request.send(formData);
        });

}
sendForm();