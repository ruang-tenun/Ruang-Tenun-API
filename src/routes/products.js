const router = require('express').Router();
const jwt = require("jsonwebtoken");
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const accessMiddleware = require("../middlewares/accessValidation");
const {body, validationResult} = require("express-validator");
const formatMySQLDate = require('../middlewares/formattedDateSql');

router.post('/', [
  body('name').notEmpty().withMessage('name is required'),
  body('description').notEmpty().withMessage('description is required'),
  body('price').notEmpty().withMessage('price is required'),
  body('category_id').notEmpty().withMessage('category_id is required'),
  body('seller_id').notEmpty().withMessage('seller_id is required'),
  body('image_url').notEmpty().withMessage('image_url is required'),
], accessMiddleware, async (req, res) => {
  const {name, description, price, category_id, seller_id, image_url} = req.body;
  const createdAt = formatMySQLDate(new Date);
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(422).json({
      status: 'fail',
      error: errors.array()
    });
  }

  const payloads = {
    name,
    description,
    price,
    category_id,
    seller_id,
    image_url,
    created_at: createdAt,
    updated_at: createdAt
  }

  const result = await prisma.products.create({
    data: {
      payloads
    }
  })

  if(!result){
    return res.status(500).json({
      status: 'fail',
      message: 'Internal Error error'
    });
  }

  return res.status(201).json({
    status: 'fail',
    message: 'created data product successfully',
    payload: payloads
  })
})

module.exports = router