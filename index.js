const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .post('/', (req, res) => {
        console.log("======");
        console.log(req);
        console.log(req.body);
        console.log(req.json);
        console.log(req.jsonObj);
      res.end(`Olololo`)
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
