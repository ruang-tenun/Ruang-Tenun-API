const express = require('express');
const router = express.Router();

// import db
const connection = require('../config/database');

router.get('/', (req, res) => {
  connection.query("SELECT * FROM posts ORDER BY id DESC", (err,  rows) => {
    if(err){
      return res.status(500).json({
        status: 'fail',
        message: `Internal Server Error`
      });
    } else {
      return res.status(200).json({
        status: 'success',
        message: "List Data Posts",
        data: rows
      })
    }
  })
})

module.exports = router;