require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require("morgan");
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const InputError = require('./src/middlewares/errors/InputError')

// initialize app
const app = express();
const port = process.env.PORT || 3000;
const fileData = multer();
// Konfigurasi Multer untuk multipart/form-data
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal 2MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, and JPEG formats are allowed!'), false);
    }
  },
});

app.use(express.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))
// parse application/json
// app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(bodyParser.json())
app.use(cors({origin: '*'}))
app.use(morgan("dev"));

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

// import route category
const categoryRoute = require('./src/routes/categories');
app.use('/api/categories', upload.single('image_url'), categoryRoute);

// import route product
const productRoute = require('./src/routes/products');
app.use('/api/products', upload.single('image_url'), productRoute);

// import route ecommerce link
const linkRoute = require("./src/routes/links");
app.use("/api/links", linkRoute)

// import route favorite
const favoriteRoute = require("./src/routes/favorites");
app.use("/api/favorites", favoriteRoute)

// import route profile
const profileRoute = require("./src/routes/profile");
app.use("/api/profile", profileRoute)

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