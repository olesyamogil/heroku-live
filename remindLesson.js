const config = require('./config.js');
const express = require('express')

express()
    .get('/', (req, res) => {

        res.end(`Olololo`)
    })
    .listen(config.APP_PORT, () => console.log(`Listening on ${ PORT }`))
