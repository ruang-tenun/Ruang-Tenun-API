require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// initialize app
const app = express()
const port = 3000

app.use(cors())
app.use(express.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
// parse application/json
app.use(bodyParser.json())
app.use(cors({origin: '*'}))

// initialize oauth google
// google login route
const googleAuth = require("./src/routes/googleAuth");
app.use('/auth/google', googleAuth)

// import route login
const authLogin = require("./src/routes/auth");
app.use('/api',authLogin)

// import route posts
const postRoute = require("./src/routes/posts");
app.use("/api/posts", postRoute)

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