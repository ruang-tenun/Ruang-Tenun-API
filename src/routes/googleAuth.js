const router = require('express').Router();
const { google } = require('googleapis');
const connection = require('../../config/database');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();

// initialize oauth google
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/auth/google/callback'
);

const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
]

const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  include_granted_scopes: true
})

// format datetime mysql for created at and updated at
const formatMySQLDate = (date) => {
  const dt = new Date(date);
  const pad = (n) => (n < 10 ? '0' + n: n);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`
}

router.get('/', (req, res) => {
  res.redirect(authorizationUrl);
});

// google login route callback
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if(!code) {
    return res.status(401).json({
      status: 'fail',
      message: 'Authorization code is missing'
    })
  }

  try {
    const {tokens} = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    })
    const {data} = await oauth2.userinfo.get()

    if(!data.email || !data.username){
      return res.status(400).json({
        status: 'fail',
        message: 'Google account data is incomplete!'
      })
    }

    const result = await prisma.users.findFirst({
      where: {
        email: data.email
      }
    })
    console.log(result);

    if (!result) {
      const createdAt = formatMySQLDate(new Date());
      const row = {
        name: data.username,
        email: data.email,
        phone: "-",
        address: "-",
        created_at: new Date(createdAt),
        updated_at: new Date(createdAt)
      }

      const insertData = await prisma.users.create({
        data: row
      })

      if(!insertData) {
        return res.status(500).json({
          status: 'fail',
          message: 'internal server error'
        })
      }

      return res.status(201).json({
        status: 'success',
        message: 'user registered successfully',
        payload: row
      });
    } else {
      const payload = {
        name: data.name,
        email: data.email
      }
  
      return res.status(200).json({
        status: 'success',
        message: 'user logged in successfully',
        payload: payload
      })
    }

    // connection.query("SELECT * FROM users WHERE email = ? ", data.email, (err, field) => {
    //   if(err) {
    //     console.error('Database error: ', err);
    //     return res.status(500).json({
    //       status: 'fail',
    //       message: 'internal server error!'
    //     });
    //   }

    //   if(field.length < 1){
    //     connection.query("INSERT INTO users SET ?", row, (err, field) => {
    //       if(err) {
    //         console.error('Insert error:', err);
    //         return res.status(500).json({
    //           status: 'fail',
    //           message: 'internal server error'
    //         })
    //       }

    //       return res.status(201).json({
    //         status: 'success',
    //         message: 'user registered successfully',
    //         payload: row
    //       });
    //     })
      // } 
    // })
  } catch (error) {
    console.error('Oauth error: ',error);
    return res.status(400).json({
      status: 'fail',
      message: 'Failed to authenticate'
    })
  }
});

module.exports = router;