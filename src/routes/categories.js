const router = require('express').Router();
const accessMiddleware = require('../middlewares/accessValidation');
const {body} = require("express-validator");
const categoryController = require('../controllers/categoryController');

router.post('/', accessMiddleware, [
  // validation
  body('name').notEmpty().withMessage('name is required'),
  body('description').notEmpty().withMessage('description is required'),
  body('address').notEmpty().withMessage('address is required')
], categoryController.postCategory);

router.get('/', accessMiddleware, categoryController.getAllCategory);
router.get('/(:id)', accessMiddleware, categoryController.getCategoryById);

router.put('/(:id)', accessMiddleware, [
  // validation
  body('name').notEmpty().withMessage('name is required'),
  body('description').notEmpty().withMessage('description is required'),
  body('address').notEmpty().withMessage('address is required')
], categoryController.updateCategoryById);

router.delete('/(:id)', accessMiddleware, categoryController.deleteCategoryById);

module.exports = router;