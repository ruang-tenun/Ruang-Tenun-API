const router = require("express").Router();
const connection = require("../config/database");
const bcrypt = require('bcrypt');
const { nextFunction, Request, Response, Router } = require('express');
const { body, validationResult } = require("express-validator");
const jwt = require('jsonwebtoken')
const { jwtPayload } = require('jsonwebtoken');

const formatMySQLDate = (date) => {
  const dt = new Date(date);
  const pad = (n) => (n < 10 ? '0'+n : n);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
}

router.post('/register', [
  body('name').notEmpty().withMessage('name is required'),
  body('email').notEmpty().withMessage('email is required'),
  body('password').notEmpty().withMessage('password is required'),
  body('no_telp').notEmpty().withMessage('telp is required'),
  body('jenis_kelamin').notEmpty().withMessage('jenis kelamin is required'),
  body('address').notEmpty().withMessage('address is required')
],async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).json({
      error: errors.array()
    })
  }

  const {name, email, password, no_telp, jenis_kelamin, address} = req.body;
  const createdAt = formatMySQLDate(new Date());

  const hashPass = await bcrypt.hash(password, 10);

  const payload = {
    name,
    email,
    no_telp,
    address,
    jenis_kelamin,
    password: hashPass,
    created_at: createdAt,
    updated_at: createdAt
  }

  connection.query("INSERT INTO users SET ? ", payload, (err, fields) => {
    if(err) {
      console.error(`Database error: ${err}`);
      return res.status(500).json({
        status: 'fail',
        message: 'internal error'
      })
    }

    return res.status(201).json({
      status: 'success',
      message: 'user registered successfully!',
      payload: fields[0]
    })
  })
});

router.post('/login', async (req, res) => {
  const {email, password} = req.body;
  // const isPassword = await bcrypt.compare(password)

  connection.query("SELECT * FROM users WHERE email = ?", [email], async (err, field) => {
    if(err){
      console.error(`Database error: ${err}`);
      return res.status(500).json({
        status: 'fail',
        message: 'internal error'
      })
    }

    if(field.length == 0){
      return res.status(404).json({
        status: 'fail',
        message: 'email is not found'
      })
    }

    const isPass = await bcrypt.compare(password, field[0].password);

    if(!isPass){
      return res.status(403).json({
        status: 'fail',
        message: 'email or password is wrong'
      })
    } else {
      const payload = {
        id: field[0].id,
        name: field[0].name,
        email: field[0].email,
        address: field[0].address
      }

      const secret = process.env.JWT_SECRET;
      const expIn = 60*60*1;
      const token = jwt.sign(payload, secret, {expiresIn: expIn});

      return res.status(200).json({
        status: 'success',
        message: 'user logged in successfully',
        payload,
        token
      })
    }
  })
});

module.exports = router