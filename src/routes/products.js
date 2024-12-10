const router = require('express').Router();
const accessMiddleware = require("../middlewares/accessValidation");
const {body, validationResult} = require("express-validator");
const productController = require('../controllers/productController');

router.post('/', [
  body('name').notEmpty().withMessage('name is required'),
  body('category_id').notEmpty().withMessage('category_id is required'),
  body('seller_id').notEmpty().withMessage('seller_id is required'),
  // body('image_url').notEmpty().withMessage('image_url is required'),
], accessMiddleware, productController.postProductHandler);

router.get("/", accessMiddleware, productController.getAllProductsHandler);

// router.get("/", accessMiddleware, productController.getProductByCategoryIdHandler);

router.get("/:product_id", accessMiddleware, productController.getProductByIdHandler);

router.put("/:product_id", [
  body('name').notEmpty().withMessage('name is required'),
  body('category_id').notEmpty().withMessage('category_id is required'),
  body('image_url').notEmpty().withMessage('image_url is required'),
], accessMiddleware, productController.updateProductByIdHandler)

router.delete("/:product_id", accessMiddleware, productController.deleteProductByIdHandler)

module.exports = router