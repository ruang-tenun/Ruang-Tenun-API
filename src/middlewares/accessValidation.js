const jwt = require('jsonwebtoken');

const accessValidation = (req, res, next) => {
  const { authorization } = req.headers;

  if(!authorization){
    return res.status(401).json({
      status: 'fail',
      message: 'needed token'
    })
  }

  const token = authorization.split(' ')[1];
  
  if(!token){
    return res.status(401).json({
      status: 'fail',
      message: 'Authorization header format must be: Bearer <token>'
    })
  }

  const secret = process.env.JWT_SECRET

  if(!secret){
    console.error('JWT_SECRET is not defined in environment variables.');
    return res.status(500).json({
      message: 'Internal server error',
    });
  }

  try {
    const jwtDecode = jwt.verify(token, secret);

    if(typeof jwtDecode == 'object' && jwtDecode.id && jwtDecode.email){
      req.userData = {
        id: jwtDecode.id,
        email: jwtDecode.email
      }
    } else {
      return res.status(401).json({
        status: 'fail',
        message: 'token is invalid'
      })
    }
  } catch (error) {
    console.error('JWT verification error: ', error);
    return res.status(401).json({
      status: 'fail',
      message: 'unauthorized'
    })
  }

  next();
}

module.exports = accessValidation;