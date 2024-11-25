const express = require('express');

// initialize app
const app = express()
const port = 3000

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