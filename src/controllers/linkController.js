const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();
const {validationResult} = require('express-validator');
const serverError = require("../middlewares/serverError");
const notFoundError = require("../middlewares/notFoundError");

const getAllLinkHandler = async (req, res) => {
  try {
    const result = await prisma.ecommercelinks.findMany();
    
    return res.status(200).json({
      status: "success",
      message: "get all data ecommerce links successfully",
      payload: result
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "internal server error",
      error: error
    });
  }
}

const postLinkHandler = async (req, res) => {
  try {
    const {product_id, ecommerce_name, link_url} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(422).json({
        status: 'fail',
        error: errors.array()
      })
    }
    const payloads = {
      product_id: Number(product_id), ecommerce_name, link_url
    }
    
    await prisma.ecommercelinks.create({data: payloads});

    return res.status(201).json({
      status: 'success',
      message: 'post data ecommerce link has been successfully',
      payload: payloads
    })
  } catch (error) {
    return res.status(500).json(serverError("Internal server error", error))
  }
}

const updateLinkByIdHandler = async (req, res) => {
  try {
    const {link_id} = req.params;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(422).json({
        status: 'fail',
        error: errors.array()
      })
    }
    const {product_id, ecommerce_name, link_url} = req.body;
    const payloads = {
      product_id: Number(product_id), ecommerce_name, link_url
    }
    
    const checkId = await prisma.ecommercelinks.findUnique({where: {link_id: Number(link_id)}});

    if(!checkId) {
      return res.status(404).json(notFoundError("data ecommerce link is not found"))
    }

    await prisma.ecommercelinks.update({ where: {link_id: Number(link_id)}, data: payloads})

    return res.status(200).json({
      status: 'success',
      message: 'update data ecommerce link has been successfully',
      payload: payloads
    })
  } catch (error) {
    return res.status(500).json(serverError("Internal server error", error))
  }
}

const getLinkByIdHandler = async (req, res) => {
  try {
    const {link_id} = req.params;

    const result = await prisma.ecommercelinks.findUnique({where: {link_id: Number(link_id)}});

    if(!result){
      return res.status(404).json(notFoundError("Data ecommerce link is not found"));
    }
    
    return res.status(200).json({
      status: "success",
      message: "get detail data ecommerce link successfully",
      payload: result
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "internal server error",
      error: error
    });
  }
}

const deleteLinkByIdHandler = async (req, res) => {
  try {
    const {link_id} = req.params;

    const result = await prisma.ecommercelinks.findUnique({where: {link_id: Number(link_id)}});

    if(!result){
      return res.status(404).json(notFoundError("Data link is not found"));
    }

    await prisma.ecommercelinks.delete({where: {link_id: Number(link_id)}})
    
    return res.status(200).json({
      status: "success",
      message: "delete data ecommerce link successfully"
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "internal server error",
      error: error
    });
  }
}

module.exports = {getAllLinkHandler, postLinkHandler, getLinkByIdHandler, deleteLinkByIdHandler, updateLinkByIdHandler};