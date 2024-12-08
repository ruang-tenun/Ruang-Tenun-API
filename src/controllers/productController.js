const {PrismaClient} = require("@prisma/client");
const {Storage} = require('@google-cloud/storage');
const prisma = new PrismaClient();
const {validationResult} = require('express-validator');
const formatMySQLDate = require("../middlewares/formattedDateSql");
const path = require('path');

const pathKey = path.resolve(__dirname, "../../serviceaccount.json");
const bucketName = "rtab_bucket_image";
const gcs = new Storage({
  projectId: process.env.PROJECT_ID,
  keyFilename: pathKey,
});
const bucket = gcs.bucket(bucketName);

const getProductByCategoryIdHandler = async (req, res) => {
  

  const payload = result.map((rs) => ({
    product_id: rs.product_id,
    name: rs.name,
    address: rs.address,
    ecommerce_url: rs.ecommercelinks[0]?.link_url ?? "null",
    ecommerce: rs.ecommercelinks[0]?.ecommerce_name ?? "null",
    latitude: rs.latitude,
    longitude: rs.longitude,
    category: rs.categories.name,
    seller: rs.sellers.name,
    image_url: rs.image_url,
    created_at: rs.created_at,
    updated_at: rs.updated_at
  }))
  
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
    payload: payload
  })
}

const postProductHandler = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 'fail',
      error: errors.array(),
    });
  }

  if (!req.file) {
    return res.status(422).json({
      status: 'fail',
      error: 'image must be uploaded',
    });
  }

  const imageName = new Date().toISOString() + "-" + req.file.originalname.replace(/ /g, "_");
  const file = bucket.file(imageName);

  const stream = file.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  stream.on("error", (err) => {
    return res.status(500).json({
      status: "fail",
      message: "Failed to upload image to GCS",
      error: err.message,
    });
  });

  stream.on("finish", async () => {
    // URL akses publik file di GCS
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${imageName}`;

    const { name, category_id, seller_id, address, longitude, latitude } = req.body;
    const createdAt = formatMySQLDate(new Date());

    const payloads = {
      name,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      category_id: parseInt(category_id),
      seller_id: parseInt(seller_id),
      image_url: publicUrl,
      created_at: new Date(createdAt),
      updated_at: new Date(createdAt),
    };

    try {
      const result = await prisma.products.create({
        data: payloads,
      });

      return res.status(201).json({
        status: "success",
        message: "Created data product successfully",
        payload: result,
      });
    } catch (error) {
      return res.status(500).json({
        status: "fail",
        message: "Internal Server Error",
        error: error.message,
      });
    }
  });

  stream.end(req.file.buffer);
}

const getAllProductsHandler = async (req, res) => {
  const {category} = req.query;
  console.log(category);
  
  let result;
  if(category == undefined){
    result = await prisma.products.findMany({include: {categories: true, sellers: true, ecommercelinks: true}});
  } else {
    result = await prisma.products.findMany({
      where: {category_id: Number(category)},
      include: {
        categories: true,
        sellers: true,
        ecommercelinks: true
      }
    });
  }

  const payload = result.map((rs) => ({
    product_id: rs.product_id,
    name: rs.name,
    address: rs.address,
    ecommerce_url: rs.ecommercelinks[0]?.link_url,
    ecommerce: rs.ecommercelinks[0]?.ecommerce_name,
    latitude: rs.latitude,
    longitude: rs.longitude,
    category: rs.categories.name,
    seller: rs.sellers.name,
    image_url: rs.image_url,
    created_at: rs.created_at,
    updated_at: rs.updated_at
  }))
  
  if(!result){
    return res.status(500).json({
      status: 'fail',
      message: 'internal server error'
    })
  }

  return res.status(200).json({
    status: 'success',
    message: category ? 'get all data product by id category successfully' : 'get all data product successfully',
    payload: payload
  })
}

const getProductByIdHandler = async (req, res) => {
  const {product_id} = req.params
  const result = await prisma.products.findMany({
    where: {product_id: Number(product_id)},
    include: {
      categories: true,
      sellers: true,
      ecommercelinks: true
    }
  });
  const payload = result.map((rs) => ({
    product_id: rs.product_id,
    name: rs.name,
    address: rs.address,
    ecommerce_url: rs.ecommercelinks[0]?.link_url ?? "null",
    ecommerce: rs.ecommercelinks[0]?.ecommerce_name ?? "null",
    latitude: rs.latitude,
    longitude: rs.longitude,
    category: rs.categories.name,
    seller: rs.sellers.name,
    image_url: rs.image_url,
    created_at: rs.created_at,
    updated_at: rs.updated_at
  }))
  
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
    payload: payload
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

module.exports = {postProductHandler, getAllProductsHandler, getProductByCategoryIdHandler, getProductByIdHandler, updateProductByIdHandler, deleteProductByIdHandler}