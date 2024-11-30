const router = require('express').Router();
// const {PrismaClient} = require('@prisma/client');
// const prisma = new PrismaClient();
const accessMiddleware = require('../middlewares/accessValidation');
const {body} = require("express-validator");
const categoryController = require('../controllers/categoryController');
// const formatMySQLDate = require('../middlewares/formattedDateSql');

router.post('/', accessMiddleware, [
  // validation
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required')
], categoryController.postCategory);

router.get('/', accessMiddleware, categoryController.getAllCategory);
router.get('/(:id)', accessMiddleware, categoryController.getCategoryById);

router.put('/', accessMiddleware, [
  // validation
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required')
], categoryController.updateCategoryById);

router.delete('/(:id)', accessMiddleware, categoryController.deleteCategoryById);

module.exports = router;