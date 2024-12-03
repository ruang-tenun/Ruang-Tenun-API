const router = require("express").Router();
const bcrypt = require('bcrypt');
const { nextFunction, Request, Response } = require('express');
const { body, validationResult } = require("express-validator");
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const formatMySQLDate = require("../middlewares/formattedDateSql");
const serverError = require("../middlewares/serverError");

router.post('/register/seller', [
  body('name').notEmpty().withMessage('name is required'),
  body('email').notEmpty().withMessage('email is required'),
], async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(422).json({
        status: 'fail',
        message: errors.array()
      })
    }

    const {name, email, password} = req.body;
    const hashPass = await bcrypt.hash(password, 10);
    const createdAt = formatMySQLDate(new Date());
    const data = {
      name,
      email,
      password: hashPass,
      phone: "08XXXX",
      address: "XXXX",
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
  body('username').notEmpty().withMessage('username is required'),
  body('email').notEmpty().withMessage('email is required'),
  body('password').notEmpty().withMessage('password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).json({
      error: errors.array()
    })
  }

  const {username, email, password} = req.body;
  const createdAt = formatMySQLDate(new Date());

  const hashPass = await bcrypt.hash(password, 10);

  const data = {
    username,
    email,
    phone: "08XXXX",
    address: "XXXX",
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

  if (!result) {
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
  try {
    const {email, password} = req.body;
    const resultUser = await prisma.users.findUnique({
      where: { email }
    })
    const resultSeller = await prisma.sellers.findUnique({where: {email}})

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
          id: resultUser.user_id,
          username: resultUser.username,
          email: resultUser.email
        }
    
        const secret = process.env.JWT_SECRET;
        const expIn = 60*60*1;
        const token = jwt.sign(payload, secret, {expiresIn: expIn});
        const refresh_token_id = await prisma.tokens.findFirst({
          where: {
            AND: [
              {auth_id: resultUser.user_id},
              { role: "user_id"}
            ]
          }
        });

        if(refresh_token_id){
          const refresh_token = await prisma.tokens.update({
            data: {
              refresh_token: token,
              verified_token: "true"
            },
            where: {
              token_id: refresh_token_id.token_id 
            }
          })
          return res.status(200).json({
            status: 'success',
            message: 'user logged in successfully',
            payload,
            token
          })
        } else {
          const createdAt = formatMySQLDate(new Date());
          const refresh_token = await prisma.tokens.create({
            data: {
              refresh_token: token,
              auth_id: Number(resultUser.user_id),
              role: 'user_id',
              verified_token: "true",
              created_at: new Date(createdAt)
            }
          })
          return res.status(200).json({
            status: 'success',
            message: 'user logged in successfully',
            payload,
            token
          })
        }
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
          id: resultSeller.seller_id,
          name: resultSeller.name,
          email: resultSeller.email,
        }

        const secret = process.env.JWT_SECRET;
        const expIn = 60 * 60 * 1;
        const token = jwt.sign(payload, secret, {expiresIn: expIn})
        const refresh_token_id = await prisma.tokens.findFirst({
          where: {
            AND: [
              {auth_id: resultSeller.seller_id},
              {role: 'seller_id'}
            ]
          }
        })

        if(refresh_token_id){
          const refresh_token = await prisma.tokens.update({
            data: {
              refresh_token: token,
              verified_token: "true"
            },
            where: {
              token_id: refresh_token_id.token_id 
            }
          })
          return res.status(200).json({
            status: 'success',
            message: 'seller logged in successfully',
            payload,
            token
          })
        }
        const createdAt = formatMySQLDate(new Date());
        await prisma.tokens.create({
          data: {
            refresh_token: token,
            auth_id: Number(resultSeller.seller_id),
            role: 'seller_id',
            verified_token: "true",
            created_at: new Date(createdAt)
          }
        })

        return res.status(200).json({
          status: 'success',
          message: 'seller logged in successfully',
          payload,
          token
        })
      }
    }
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      error: error.message
    })
  }

  // connection.query("SELECT * FROM users WHERE email = ?", [email], async (err, field) => {
  //   const isPass = await bcrypt.compare(password, field[0].password);
  // })
});

router.get("/logout", async (req, res) => {
  try {
    const secret = process.env.JWT_SECRET;
    const { authorization } = req.headers;
    const token = authorization.split(' ')[1];
    const refresh_token = await prisma.tokens.findFirst({where: {refresh_token: token}});
    const verified_token = refresh_token.verified_token

    if(verified_token == "true"){
      const jwtDecode = jwt.verify(token,secret);
      if(typeof jwtDecode == 'object' && jwtDecode.id && jwtDecode.email){
        req.userData = {
          id: null,
          email: null,
        }
        await prisma.tokens.update({where: {token_id: refresh_token.token_id}, data: {verified_token: "false"}});
        return res.json({ status: 'success', message: 'Logout sucessfully' }).status(200);
      } else {
        return res.json({ status: 'fail', message: 'Token is invalid' }).status(422);
      }
    } else {
      return res.json({ status: 'fail', message: 'Token required' }).status(422);
    }
  } catch (error) {
    return res.status(500).json(serverError("Internal server error", error))
  }
});

module.exports = router