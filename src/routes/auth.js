const router = require("express").Router();
const connection = require("../../config/database");
const bcrypt = require('bcrypt');
const { nextFunction, Request, Response, Router } = require('express');
const { body, validationResult } = require("express-validator");
const jwt = require('jsonwebtoken')
const { jwtPayload } = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const formatMySQLDate = (date) => {
  const dt = new Date(date);
  const pad = (n) => (n < 10 ? '0' + n : n);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
}

router.post('/register/seller', [
  body('name').notEmpty().withMessage('name is required'),
  body('email').notEmpty().withMessage('email is required'),
  body('phone').notEmpty().withMessage('phone is required'),
  body('address').notEmpty().withMessage('address is required'),
], async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(422).json({
        status: 'fail',
        message: errors.array()
      })
    }

    const {name, email, phone, address, password} = req.body;
    const hashPass = await bcrypt.hash(password, 10);
    const createdAt = formatMySQLDate(new Date());
    const data = {
      name,
      email,
      password: hashPass,
      phone,
      address,
      created_at: new Date(createdAt),
      updated_at: new Date(createdAt),
    }

    const checkEmail = await prisma.sellers.findFirst({where: {email: email}});
    if(checkEmail){
      return res.status(400).json({
        status: 'fail',
        message: 'email sudah terdaftar'
      })
    }

    const result = await prisma.sellers.create({data});
    if(!result){
      return res.status(500).json({
        status: 'fail',
        message: 'internal error'
      })
    }
    return res.status(201).json({
      status: 'success',
      message: 'sellers registered has been successfully',
      payload: result
    })
});

router.post('/register', [
  body('name').notEmpty().withMessage('name is required'),
  body('email').notEmpty().withMessage('email is required'),
  body('password').notEmpty().withMessage('password is required'),
  body('phone').notEmpty().withMessage('telp is required'),
  body('address').notEmpty().withMessage('address is required')
],async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).json({
      error: errors.array()
    })
  }

  const {name, email, password, phone, address} = req.body;
  const createdAt = formatMySQLDate(new Date());

  const hashPass = await bcrypt.hash(password, 10);

  const data = {
    name,
    email,
    phone,
    address,
    password: hashPass,
    created_at: new Date(createdAt),
    updated_at: new Date(createdAt)
  }

  const checkEmail = await prisma.users.findFirst({
    where: {
      email: String(email)
    }
  });
  
  if(checkEmail != null){
    return res.status(400).json({
      status: 'fail',
      message: 'email sudah terdaftar'
    })
  }

  const result = await prisma.users.create({
    data
  })

  if(!result){
    return res.status(500).json({
      status: 'fail',
      message: 'internal error'
    })
  }

  return res.status(201).json({
    status: 'success',
    message: 'user registered successfully!',
    payload: result
  })

  // connection.query("INSERT INTO users SET ? ", payload, (err, fields) => {
  //   if(err) {
  //     console.error(`Database error: ${err}`);
  //     return res.status(500).json({
  //       status: 'fail',
  //       message: 'internal error'
  //     })
  //   }
  // })
});

router.post('/login', async (req, res) => {
  const {email, password} = req.body;
  const resultUser = await prisma.users.findFirst({
    where: { email }
  })
  const resultSeller = await prisma.sellers.findFirst({where: {email}})

  if(!resultUser && !resultSeller){
    return res.status(404).json({
      status: 'fail',
      message: 'email is not found'
    })
  }

  if(resultUser) {
    const isPass = await bcrypt.compare(password, resultUser.password)
  
    if(!isPass){
      return res.status(403).json({
        status: 'fail',
        message: 'email or password is wrong'
      })
    } else {
      const payload = {
        id: resultUser.id,
        name: resultUser.name,
        email: resultUser.email,
        // address: resultUser.address
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
  } else {
    const isPass = await bcrypt.compare(password, resultSeller.password);
    if(!isPass) {
      return res.status(403).json({
        message: 'fail',
        message: 'email or password is wrong'
      })
    } else {
      const payload = {
        id: resultSeller.id,
        name: resultSeller.name,
        email: resultSeller.email,
      }

      const secret = process.env.JWT_SECRET;
      const expIn = 60 * 60 * 1;
      const token = jwt.sign(payload, secret, {expiresIn: expIn})

      return res.status(200).json({
        status: 'success',
        message: 'seller logged in successfully',
        payload,
        token
      })
    }
  }


  // connection.query("SELECT * FROM users WHERE email = ?", [email], async (err, field) => {
  //   const isPass = await bcrypt.compare(password, field[0].password);
  // })
});

module.exports = router