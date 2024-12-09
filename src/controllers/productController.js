const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();
const {validationResult} = require('express-validator');
const formatMySQLDate = require("../middlewares/formattedDateSql");

const postProductHandler = async (req, res) => {
  const errors = validationResult(req);
  
  if(!errors.isEmpty()){
    return res.status(422).json({
      status: 'fail',
      error: errors.array()
    });
  }
  
  if(!req.file){
    return res.status(422).json({
      status: 'fail',
      error: 'image must be uploaded'
    });
  }

  console.log(req.file);
  
  
  const {name, category_id, seller_id, image_url, address, longitude, latitude} = req.body;
  const createdAt = formatMySQLDate(new Date);

  const payloads = {
    name,
    address,
    latitude,
    longitude,
    category_id,
    seller_id,
    image_url,
    created_at: new Date(createdAt),
    updated_at: new Date(createdAt)
  }

  console.log(payloads);
  

  const result = await prisma.products.create({
    data: payloads
  })

  if(!result){
    return res.status(500).json({
      status: 'fail',
      message: 'Internal Error'
    });
  }

  return res.status(201).json({
    status: 'fail',
    message: 'created data product successfully',
    payload: payloads
  })
}

const getAllProductsHandler = async (req, res) => {
  const result = await prisma.products.findMany();
  if(!result){
    return res.status(500).json({
      status: 'fail',
      message: 'internal server error'
    })
  }

  return res.status(200).json({
    status: 'success',
    message: 'get all data category successfully',
    payload: result
  })
}

const getProductByIdHandler = async (req, res) => {
  const {product_id} = req.params
  const result = await prisma.products.findMany({
    where: {product_id: Number(product_id)}
  });
  if(!result){
    return res.status(500).json({
      status: 'fail',
      message: 'internal server error'
    })
  }

  if(result.length < 1) {
    return res.status(404).json({
      status: 'fail',
      message: 'id product not found'
    })
  }

  return res.status(200).json({
    status: 'success',
    message: 'get data category by id successfully',
    payload: result
  })
}

const updateProductByIdHandler = async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).json({
      status: 'fail',
      error: errors.array()
    })
  }

  const {product_id} = req.params
  const {name, category_id, image_url, address} = req.body;
  const updatedAt = formatMySQLDate(new Date());
  const checkId = await prisma.products.findFirst({where: {product_id: Number(product_id)}});

  if(!checkId) {
    return res.status(404).json({
      status: 'fail',
      message: 'id product not found'
    })
  }

  const payload = {
    name, category_id, image_url, address, updated_at: new Date(updatedAt)
  }
  const result = await prisma.products.update({
    data: payload,
    where: {product_id: Number(product_id)}
  })

  if(!result) {
    return res.status(500).json({
      status: 'fail',
      message: 'internal server error'
    })
  }
  
  return res.status(200).json({
    status: 'success',
    message: 'updated data product successfully',
    payload: result
  })
}

const deleteProductByIdHandler = async (req, res) => {
  const {product_id} = req.params;
  const checkId = await prisma.products.findFirst({where: {product_id: Number(product_id)}});
  const checkLink = await prisma.ecommercelinks.findMany({where: {product_id: Number(product_id)}});
  const checkFav = await prisma.favorites.findMany({where: {product_id: Number(product_id)}});
  if(!checkId){
    return res.status(404).json({
      status: 'fail',
      message: 'id product not found'
    })
  }
  if(checkLink){
    await prisma.ecommercelinks.delete({where: {product_id: Number(product_id)}})
  }
  if(checkFav){
    await prisma.favorites.delete({where: {product_id: Number(product_id)}})
  }

  const result = await prisma.products.delete({where: {product_id: Number(product_id)}})
  if(!result) {
    return res.status(500).json({
      status: 'fail',
      message: 'internal server error'
    })
  }
  
  return res.status(200).json({
    status: 'success',
    message: 'delete data product successfully'
  })
}

module.exports = {postProductHandler, getAllProductsHandler, getProductByIdHandler, updateProductByIdHandler, deleteProductByIdHandler}