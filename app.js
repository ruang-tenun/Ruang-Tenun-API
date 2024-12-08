require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require("morgan");
const multer = require('multer');

// initialize app
const app = express();
const port = 3000;
const fileData = multer();

app.use(express.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
// parse application/json
app.use(bodyParser.json())
app.use(cors({origin: '*'}))
app.use(morgan("dev"));
app.use(fileData.array())

// Middleware untuk menangani kesalahan (onPreResponse
app.use((req, res, next) => {
  const contentLength = parseInt(req.headers["content-length"] || "0", 10);
  const maxSize = 1000000; // 1MB

  if(contentLength > maxSize) {
    return res.status(413).json({
      status: "fail",
      message: `Payload content length greater than maximum allowed: ${maxSize}`
    });
  }
  next();
})

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

// import route category
const categoryRoute = require('./src/routes/categories');
app.use('/api/categories', categoryRoute);

// import route product
const productRoute = require('./src/routes/products');
app.use('/api/products', productRoute);

// import route ecommerce link
const linkRoute = require("./src/routes/links");
app.use("/api/links", linkRoute)

// import route favorite
const favoriteRoute = require("./src/routes/favorites");
app.use("/api/favorites", favoriteRoute)

// route
app.get("/", (req, resp) => {
  resp.status(200).json({
    status: 'success',
    message: 'Hello Ruang Tenun'
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof InputError) {
    return res.status(err.statusCode || 400).json({
      status: "fail",
      message: "Terjadi kesalahan dalam server",
    });
  }

  res.status(err.statusCode || 500).json({
    status: "fail",
    message: err.message || "Internal Server Error",
  });
});

// start server
app.listen(port, () => {
    console.log(`Server started on url: http://localhost:${port}`)
})