const express = require('express');

// initialize app
const app = express()
const port = 3000

// route
app.get("/", (req, resp) => {
  resp.send('Hello Ruang Tenun!')
})

// start server
app.listen(port, () => {
    console.log(`Server started on url: http://localhost:${port}`)
})