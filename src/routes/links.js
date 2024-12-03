const router = require("express").Router();
const {body} = require("express-validator")
const accessMiddleware = require("../middlewares/accessValidation");
const linkController = require("../controllers/linkController")

router.get("/", accessMiddleware, linkController.getAllLinkHandler);

router.get("/(:link_id)", accessMiddleware, linkController.getLinkByIdHandler);

router.delete("/(:link_id)", accessMiddleware, linkController.deleteLinkByIdHandler);

router.post("/", accessMiddleware, [
  body('product_id').notEmpty().withMessage('product id required'),
  body('ecommerce_name').notEmpty().withMessage('ecommerce name required'),
  body('link_url').notEmpty().withMessage('link url required'),
], linkController.postLinkHandler);

router.put("/(:link_id)", [
  body('product_id').notEmpty().withMessage('product id required'),
  body('ecommerce_name').notEmpty().withMessage('ecommerce name required'),
  body('link_url').notEmpty().withMessage('link url required'),
], accessMiddleware, linkController.updateLinkByIdHandler);

module.exports = router
