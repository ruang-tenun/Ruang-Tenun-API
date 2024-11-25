const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// initialize app
const app = express()
const port = 3000

app.use(cors())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

// import route posts
const postRouter = require("./routes/posts");
app.use("/api/posts", postRouter)

// route
app.get("/", (req, resp) => {
  resp.status(200).json({
    status: 'success',
    message: 'Hello Ruang Tenun'
  })
})

// start server
app.listen(port, () => {
    console.log(`Server started on url: http://localhost:${port}`)
})